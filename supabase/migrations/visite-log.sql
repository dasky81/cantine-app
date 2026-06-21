-- Migration: tabella visite_log per analytics

CREATE TABLE IF NOT EXISTS visite_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visite_log ENABLE ROW LEVEL SECURITY;

-- Chiunque può inserire una visita (analytics pubbliche)
CREATE POLICY "visite_insert_public" ON visite_log FOR INSERT WITH CHECK (true);

-- Solo admin può leggere
CREATE POLICY "visite_select_admin" ON visite_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_visite_log_path ON visite_log(path, created_at DESC);
CREATE INDEX idx_visite_log_created_at ON visite_log(created_at DESC);
