import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PipelineMetric, PipelineConversion, Benchmark, Pipeline } from '@/integrations/supabase/phase2_types';

export const usePipeline = (companySlug?: string) => {
  const [metrics, setMetrics] = useState<PipelineMetric[]>([]);
  const [currentMetric, setCurrentMetric] = useState<PipelineMetric | null>(null);
  const [conversions, setConversions] = useState<PipelineConversion[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics for company (last 30 days)
  const fetchMetrics = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: err } = await supabase
        .from('pipeline_metrics')
        .select('*')
        .eq('company_slug', slug)
        .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (err) throw err;
      setMetrics(data || []);
      if (data && data.length > 0) setCurrentMetric(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversion metrics
  const fetchConversions = async (slug: string) => {
    try {
      const { data, error: err } = await supabase
        .from('pipeline_conversions')
        .select('*')
        .eq('company_slug', slug)
        .order('conversion_date', { ascending: false })
        .limit(100);

      if (err) throw err;
      setConversions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversions');
    }
  };

  // Fetch benchmarks for industry
  const fetchBenchmarks = async (industry: string) => {
    try {
      const { data, error: err } = await supabase
        .from('benchmarks')
        .select('*')
        .eq('industry', industry);

      if (err) throw err;
      setBenchmarks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch benchmarks');
    }
  };

  // Create/update pipeline metric
  const upsertMetric = async (metric: Omit<PipelineMetric, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      // Check if metric for this date exists
      const { data: existing } = await supabase
        .from('pipeline_metrics')
        .select('id')
        .eq('company_slug', metric.company_slug)
        .eq('metric_date', metric.metric_date)
        .single();

      let result;
      if (existing) {
        // Update
        const { data, error: err } = await supabase
          .from('pipeline_metrics')
          .update(metric)
          .eq('company_slug', metric.company_slug)
          .eq('metric_date', metric.metric_date)
          .select()
          .single();
        if (err) throw err;
        result = data;
      } else {
        // Insert
        const { data, error: err } = await supabase
          .from('pipeline_metrics')
          .insert([metric])
          .select()
          .single();
        if (err) throw err;
        result = data;
      }

      setCurrentMetric(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save metric';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Record conversion
  const recordConversion = async (
    slug: string,
    fromStage: string,
    toStage: string,
    fromCount: number,
    toCount: number
  ) => {
    try {
      const conversionRate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;
      
      const { data, error: err } = await supabase
        .from('pipeline_conversions')
        .insert([{
          company_slug: slug,
          from_stage: fromStage,
          to_stage: toStage,
          from_count: fromCount,
          to_count: toCount,
          conversion_rate: conversionRate,
        }])
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Transform current metric to Pipeline object with stages
  const getPipelineData = (): Pipeline | null => {
    if (!currentMetric) return null;

    return {
      views: {
        name: 'Views',
        count: currentMetric.views_count,
        conversionRate: currentMetric.views_conversion_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'views_to_subscribers')?.average_conversion_rate || 0,
      },
      subscribers: {
        name: 'Subscribers',
        count: currentMetric.subscribers_count,
        conversionRate: currentMetric.subscribers_conversion_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'subscribers_to_leads')?.average_conversion_rate || 0,
      },
      leads: {
        name: 'Leads',
        count: currentMetric.leads_count,
        conversionRate: currentMetric.leads_conversion_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'leads_to_mql')?.average_conversion_rate || 0,
      },
      mql: {
        name: 'MQL',
        count: currentMetric.mql_count,
        conversionRate: currentMetric.mql_conversion_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'mql_to_sql')?.average_conversion_rate || 0,
      },
      sql: {
        name: 'SQL',
        count: currentMetric.sql_count,
        conversionRate: currentMetric.sql_conversion_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'sql_to_opportunity')?.average_conversion_rate || 0,
      },
      opportunity: {
        name: 'Opportunity',
        count: currentMetric.opportunity_count,
        conversionRate: currentMetric.opportunity_win_rate,
        benchmarkRate: benchmarks.find(b => b.metric_type === 'opportunity_win')?.average_conversion_rate || 0,
      },
    };
  };

  // Set up real-time listener
  useEffect(() => {
    if (!companySlug) return;

    fetchMetrics(companySlug);
    fetchConversions(companySlug);

    const subscription = supabase
      .channel(`pipeline_metrics:${companySlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_metrics',
          filter: `company_slug=eq.${companySlug}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentMetric(payload.new as PipelineMetric);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [companySlug]);

  return {
    metrics,
    currentMetric,
    conversions,
    benchmarks,
    loading,
    error,
    fetchMetrics,
    fetchConversions,
    fetchBenchmarks,
    upsertMetric,
    recordConversion,
    getPipelineData,
  };
};
