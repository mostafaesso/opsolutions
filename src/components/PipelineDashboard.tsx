import React, { useEffect, useState } from 'react';
import { usePipeline } from '../hooks/usePipeline';
import { useCustomers } from '../hooks/useCustomers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PipelineDashboard: React.FC<{ companySlug: string }> = ({ companySlug }) => {
  const { 
    currentMetric, 
    loading, 
    fetchMetrics, 
    fetchBenchmarks, 
    getPipelineData, 
    upsertMetric 
  } = usePipeline(companySlug);
  const { customer, fetchBySlug } = useCustomers(companySlug);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>((currentMetric as unknown as Record<string, unknown>) || {});

  useEffect(() => {
    fetchMetrics(companySlug);
    fetchBySlug(companySlug);
    if (customer?.industry) {
      fetchBenchmarks(customer.industry);
    }
  }, [companySlug, customer?.industry]);

  const pipelineData = getPipelineData();
  const stages = [
    { key: 'views', label: 'Views', color: '#3b82f6' },
    { key: 'subscribers', label: 'Subscribers', color: '#8b5cf6' },
    { key: 'leads', label: 'Leads', color: '#ec4899' },
    { key: 'mql', label: 'MQL', color: '#f59e0b' },
    { key: 'sql', label: 'SQL', color: '#10b981' },
    { key: 'opportunity', label: 'Opportunity', color: '#06b6d4' },
  ];

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertMetric({
        company_slug: companySlug,
        ...formData,
      } as any);
      setShowEditForm(false);
      fetchMetrics(companySlug);
    } catch (err) {
      console.error(err);
    }
  };

  if (!pipelineData) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Multi-Stage Pipeline Dashboard</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No pipeline data yet. Add metrics to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Multi-Stage Pipeline Dashboard</h2>
        {customer && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold">{customer.industry}</span> · {customer.employee_count} employees
          </div>
        )}
      </div>

      {/* Pipeline Funnel View */}
      <div className="grid grid-cols-6 gap-2">
        {stages.map(({ key, label, color }) => {
          const stage = pipelineData[key as keyof typeof pipelineData];
          const benchmark = stage.benchmarkRate;
          const isBelow = stage.conversionRate < benchmark;

          return (
            <Card key={key} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold" style={{ color }}>
                  {stage.count}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1">
                    {isBelow ? (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    )}
                    <span>Conv: {stage.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-muted-foreground">
                    Bench: {benchmark.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Metrics Form */}
      {showEditForm && (
        <Card>
          <CardHeader>
            <CardTitle>Update Pipeline Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMetrics} className="grid grid-cols-3 gap-4">
              {stages.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium">{label} Count</label>
                  <Input
                    type="number"
                    value={(formData[`${key}_count`] as number) || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${key}_count`]: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <label className="text-sm font-medium">{label} Conversion %</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={(formData[`${key}_conversion_rate`] as number) || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${key}_conversion_rate`]: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              ))}
              <div className="col-span-3 flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Metrics'}
                </Button>
                <Button variant="outline" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Button 
        variant="outline" 
        onClick={() => {
          setFormData((currentMetric as unknown as Record<string, unknown>) || {});
          setShowEditForm(!showEditForm);
        }}
      >
        {showEditForm ? 'Cancel' : 'Edit Metrics'}
      </Button>

      {/* Conversion Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rates vs Benchmarks</CardTitle>
          <CardDescription>
            Your conversion rate compared to industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis label={{ value: 'Conversion %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="conversionRate"
                fill="#3b82f6"
                name="Your Rate"
                data={stages.map(s => ({
                  ...s,
                  conversionRate: pipelineData[s.key as keyof typeof pipelineData]?.conversionRate || 0,
                }))}
              />
              <Bar
                dataKey="benchmarkRate"
                fill="#9ca3af"
                name="Benchmark"
                data={stages.map(s => ({
                  ...s,
                  benchmarkRate: pipelineData[s.key as keyof typeof pipelineData]?.benchmarkRate || 0,
                }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(currentMetric?.opportunity_value || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMetric?.opportunity_count || 0} opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentMetric?.opportunity_win_rate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Opportunity to closed deal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">MQL to SQL Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentMetric?.sql_conversion_rate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMetric?.sql_count || 0} SQLs this period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
