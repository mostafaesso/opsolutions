-- Seed industry benchmark conversion rates for Pipeline Dashboard
-- metric_type values: views_to_subscribers, subscribers_to_leads, leads_to_mql, mql_to_sql, sql_to_opportunity, opportunity_win

INSERT INTO public.benchmarks (industry, region, metric_type, average_conversion_rate, percentile_25, percentile_75, data_points)
VALUES

-- Professional Services (HubSpot implementations, consulting, RevOps)
('Professional Services', 'Global',        'views_to_subscribers',    4.50,  2.00,  8.00,  320),
('Professional Services', 'Global',        'subscribers_to_leads',    6.00,  3.00, 10.00,  290),
('Professional Services', 'Global',        'leads_to_mql',           35.00, 20.00, 50.00,  260),
('Professional Services', 'Global',        'mql_to_sql',             40.00, 25.00, 55.00,  240),
('Professional Services', 'Global',        'sql_to_opportunity',     60.00, 45.00, 75.00,  220),
('Professional Services', 'Global',        'opportunity_win',        25.00, 15.00, 38.00,  210),

-- SaaS / Technology
('SaaS',                  'Global',        'views_to_subscribers',    3.50,  1.50,  6.00,  850),
('SaaS',                  'Global',        'subscribers_to_leads',    5.00,  2.50,  8.50,  800),
('SaaS',                  'Global',        'leads_to_mql',           28.00, 15.00, 42.00,  760),
('SaaS',                  'Global',        'mql_to_sql',             35.00, 20.00, 50.00,  730),
('SaaS',                  'Global',        'sql_to_opportunity',     55.00, 40.00, 70.00,  700),
('SaaS',                  'Global',        'opportunity_win',        22.00, 12.00, 33.00,  680),

-- B2B General
('B2B',                   'Global',        'views_to_subscribers',    3.00,  1.00,  5.50,  1200),
('B2B',                   'Global',        'subscribers_to_leads',    4.50,  2.00,  7.00,  1150),
('B2B',                   'Global',        'leads_to_mql',           25.00, 12.00, 38.00,  1100),
('B2B',                   'Global',        'mql_to_sql',             30.00, 18.00, 45.00,  1050),
('B2B',                   'Global',        'sql_to_opportunity',     50.00, 35.00, 65.00,  1000),
('B2B',                   'Global',        'opportunity_win',        20.00, 10.00, 30.00,   980),

-- E-commerce / Retail
('E-commerce',            'Global',        'views_to_subscribers',    2.50,  1.00,  4.50,  600),
('E-commerce',            'Global',        'subscribers_to_leads',    8.00,  4.00, 14.00,  580),
('E-commerce',            'Global',        'leads_to_mql',           20.00, 10.00, 32.00,  560),
('E-commerce',            'Global',        'mql_to_sql',             25.00, 12.00, 38.00,  540),
('E-commerce',            'Global',        'sql_to_opportunity',     45.00, 30.00, 60.00,  520),
('E-commerce',            'Global',        'opportunity_win',        30.00, 18.00, 45.00,  500),

-- Healthcare
('Healthcare',            'Global',        'views_to_subscribers',    2.00,  0.80,  4.00,  280),
('Healthcare',            'Global',        'subscribers_to_leads',    4.00,  1.50,  7.00,  260),
('Healthcare',            'Global',        'leads_to_mql',           30.00, 15.00, 45.00,  240),
('Healthcare',            'Global',        'mql_to_sql',             38.00, 22.00, 52.00,  220),
('Healthcare',            'Global',        'sql_to_opportunity',     58.00, 42.00, 72.00,  200),
('Healthcare',            'Global',        'opportunity_win',        28.00, 16.00, 40.00,  190),

-- Real Estate
('Real Estate',           'Global',        'views_to_subscribers',    5.00,  2.00,  9.00,  350),
('Real Estate',           'Global',        'subscribers_to_leads',    7.00,  3.00, 12.00,  330),
('Real Estate',           'Global',        'leads_to_mql',           22.00, 10.00, 35.00,  310),
('Real Estate',           'Global',        'mql_to_sql',             28.00, 15.00, 42.00,  290),
('Real Estate',           'Global',        'sql_to_opportunity',     50.00, 35.00, 65.00,  270),
('Real Estate',           'Global',        'opportunity_win',        35.00, 20.00, 50.00,  260),

-- Financial Services
('Financial Services',    'Global',        'views_to_subscribers',    2.80,  1.00,  5.00,  410),
('Financial Services',    'Global',        'subscribers_to_leads',    4.00,  1.80,  7.00,  390),
('Financial Services',    'Global',        'leads_to_mql',           32.00, 18.00, 46.00,  370),
('Financial Services',    'Global',        'mql_to_sql',             42.00, 28.00, 56.00,  350),
('Financial Services',    'Global',        'sql_to_opportunity',     62.00, 48.00, 76.00,  330),
('Financial Services',    'Global',        'opportunity_win',        30.00, 18.00, 44.00,  310)

ON CONFLICT DO NOTHING;
