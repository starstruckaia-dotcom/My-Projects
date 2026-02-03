-- StockPulse Auth & Organizations Migration
-- Run this in Supabase SQL Editor

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_organizations mapping table
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 3. Add organization_id to inventory (if not already using restaurant_id)
-- If you already have restaurant_id, you can rename it or add this new column
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_organization_id ON inventory(organization_id);

-- 5. Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- 6. Organizations policies - users can only see orgs they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organizations" ON organizations
  FOR INSERT
  WITH CHECK (true);

-- 7. User organizations policies
CREATE POLICY "Users can view their own memberships" ON user_organizations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON user_organizations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 8. Update inventory policies for organization scoping
DROP POLICY IF EXISTS "Allow all operations" ON inventory;

CREATE POLICY "Users can view inventory in their orgs" ON inventory
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inventory in their orgs" ON inventory
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update inventory in their orgs" ON inventory
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete inventory in their orgs" ON inventory
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- 9. Add trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
