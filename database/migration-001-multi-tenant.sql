-- StockPulse Multi-Tenant Migration
-- Run this in your Supabase SQL Editor AFTER the initial schema

-- 1. Create restaurant table
CREATE TABLE IF NOT EXISTS restaurant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create a default restaurant for existing data
INSERT INTO restaurant (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Restaurant', 'demo')
ON CONFLICT (slug) DO NOTHING;

-- 3. Add restaurant_id column to inventory
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurant(id);

-- 4. Assign existing inventory to default restaurant
UPDATE inventory
SET restaurant_id = '00000000-0000-0000-0000-000000000001'
WHERE restaurant_id IS NULL;

-- 5. Make restaurant_id NOT NULL after backfill
ALTER TABLE inventory
ALTER COLUMN restaurant_id SET NOT NULL;

-- 6. Create index for restaurant_id queries
CREATE INDEX IF NOT EXISTS idx_inventory_restaurant_id ON inventory(restaurant_id);

-- 7. Enable RLS on restaurant table
ALTER TABLE restaurant ENABLE ROW LEVEL SECURITY;

-- 8. Allow all operations on restaurant (adjust for production)
CREATE POLICY "Allow all operations" ON restaurant
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 9. Add updated_at trigger for restaurant
CREATE TRIGGER update_restaurant_updated_at
  BEFORE UPDATE ON restaurant
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
