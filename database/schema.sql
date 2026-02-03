-- StockPulse Database Schema
-- Run this in your Supabase SQL Editor

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  min_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations" ON inventory
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO inventory (name, category, quantity, unit, min_stock) VALUES
  ('Chicken Breast', 'Proteins', 45, 'lbs', 20),
  ('Salmon Fillet', 'Proteins', 12, 'lbs', 15),
  ('Ground Beef', 'Proteins', 30, 'lbs', 20),
  ('Olive Oil', 'Pantry', 8, 'bottles', 5),
  ('Tomatoes', 'Produce', 30, 'lbs', 25),
  ('Lettuce', 'Produce', 5, 'heads', 10),
  ('Onions', 'Produce', 40, 'lbs', 15),
  ('Garlic', 'Produce', 20, 'bulbs', 10),
  ('Mozzarella', 'Dairy', 18, 'lbs', 10),
  ('Heavy Cream', 'Dairy', 3, 'gallons', 5),
  ('Butter', 'Dairy', 12, 'lbs', 8),
  ('Pasta', 'Pantry', 40, 'lbs', 20),
  ('Rice', 'Pantry', 50, 'lbs', 25),
  ('Flour', 'Pantry', 30, 'lbs', 15);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
