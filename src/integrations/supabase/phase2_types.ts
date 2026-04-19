// Phase 2: Customer Management, Pipeline, and Improvements Types

export interface CustomerDetails {
  id: string;
  company_slug: string;
  website?: string;
  industry?: string;
  employee_count?: number;
  locations: string[];
  main_contact_name?: string;
  main_contact_email?: string;
  main_contact_phone?: string;
  hubspot_token?: string;
  hubspot_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineMetric {
  id: string;
  company_slug: string;
  metric_date: string;
  
  // Views stage
  views_count: number;
  views_sessions: number;
  views_conversion_rate: number;
  
  // Subscribers stage
  subscribers_count: number;
  subscribers_posts: number;
  subscribers_impressions: number;
  subscribers_conversion_rate: number;
  
  // Leads stage
  leads_count: number;
  leads_assigned: number;
  leads_unassigned: number;
  leads_online_source: number;
  leads_offline_source: number;
  leads_conversion_rate: number;
  
  // MQL stage
  mql_count: number;
  mql_contact_status: string;
  mql_conversion_rate: number;
  
  // SQL stage
  sql_count: number;
  sql_conversion_rate: number;
  
  // Opportunity stage
  opportunity_count: number;
  opportunity_value: number;
  opportunity_win_rate: number;
  
  created_at: string;
  updated_at: string;
}

export interface PipelineConversion {
  id: string;
  company_slug: string;
  conversion_date: string;
  from_stage: string;
  to_stage: string;
  from_count: number;
  to_count: number;
  conversion_rate: number;
  created_at: string;
}

export interface Improvement {
  id: string;
  company_slug: string;
  title: string;
  description?: string;
  category: string;
  before_image_url?: string;
  after_image_url?: string;
  before_metrics?: string;
  after_metrics?: string;
  implemented_date: string;
  impact_summary?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Benchmark {
  id: string;
  industry: string;
  region?: string;
  metric_type: string;
  average_conversion_rate: number;
  percentile_25?: number;
  percentile_75?: number;
  data_points: number;
  last_updated_at: string;
}

export interface PipelineStage {
  name: string;
  count: number;
  conversionRate: number;
  benchmarkRate: number;
  previousCount?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface Pipeline {
  views: PipelineStage;
  subscribers: PipelineStage;
  leads: PipelineStage;
  mql: PipelineStage;
  sql: PipelineStage;
  opportunity: PipelineStage;
}
