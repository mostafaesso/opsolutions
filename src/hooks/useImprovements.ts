import { useEffect, useState } from 'react';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { Improvement } from '@/integrations/supabase/phase2_types';

// Cast to any: improvements table not yet in generated types
const supabase = supabaseClient as any;

export const useImprovements = (companySlug?: string) => {
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all improvements for company
  const fetchAll = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('improvements')
        .select('*')
        .eq('company_slug', slug)
        .order('implemented_date', { ascending: false });

      if (err) throw err;
      setImprovements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch improvements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch by category
  const fetchByCategory = async (slug: string, category: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('improvements')
        .select('*')
        .eq('company_slug', slug)
        .eq('category', category)
        .order('implemented_date', { ascending: false });

      if (err) throw err;
      setImprovements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch improvements');
    } finally {
      setLoading(false);
    }
  };

  // Create improvement
  const createImprovement = async (
    improvement: Omit<Improvement, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('improvements')
        .insert([improvement])
        .select()
        .single();

      if (err) throw err;
      setImprovements([data, ...improvements]);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create improvement';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update improvement
  const updateImprovement = async (
    id: string,
    updates: Partial<Omit<Improvement, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('improvements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      
      setImprovements(
        improvements.map(imp => imp.id === id ? data : imp)
      );
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update improvement';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete improvement
  const deleteImprovement = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('improvements')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setImprovements(improvements.filter(imp => imp.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete improvement';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listener
  useEffect(() => {
    if (!companySlug) return;

    fetchAll(companySlug);

    const subscription = supabase
      .channel(`improvements:${companySlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'improvements',
          filter: `company_slug=eq.${companySlug}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setImprovements([payload.new as Improvement, ...improvements]);
          } else if (payload.eventType === 'UPDATE') {
            setImprovements(
              improvements.map(imp => 
                imp.id === (payload.new as Improvement).id 
                  ? (payload.new as Improvement)
                  : imp
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setImprovements(
              improvements.filter(imp => imp.id !== (payload.old as Improvement).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [companySlug]);

  return {
    improvements,
    loading,
    error,
    fetchAll,
    fetchByCategory,
    createImprovement,
    updateImprovement,
    deleteImprovement,
  };
};
