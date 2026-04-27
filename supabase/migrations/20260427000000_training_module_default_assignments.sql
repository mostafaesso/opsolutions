-- Trigger: when a new training module is created, assign it to ALL existing companies (visible by default)
CREATE OR REPLACE FUNCTION assign_module_to_all_companies()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_training_assignments (company_slug, module_id, is_visible, sort_order)
  SELECT slug, NEW.id, true, NEW.sort_order
  FROM companies
  ON CONFLICT (company_slug, module_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_training_module_created
  AFTER INSERT ON training_modules
  FOR EACH ROW EXECUTE FUNCTION assign_module_to_all_companies();

-- Trigger: when a new company is created, assign ALL existing training modules to it (visible by default)
CREATE OR REPLACE FUNCTION assign_all_modules_to_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_training_assignments (company_slug, module_id, is_visible, sort_order)
  SELECT NEW.slug, id, true, sort_order
  FROM training_modules
  ON CONFLICT (company_slug, module_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION assign_all_modules_to_company();

-- Backfill: assign all existing training modules to all existing companies that don't have them yet
INSERT INTO company_training_assignments (company_slug, module_id, is_visible, sort_order)
SELECT c.slug, m.id, true, m.sort_order
FROM companies c
CROSS JOIN training_modules m
ON CONFLICT (company_slug, module_id) DO NOTHING;
