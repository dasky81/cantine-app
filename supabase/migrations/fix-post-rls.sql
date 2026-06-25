-- Policy SELECT: lettura pubblica per post pubblicati + admin vede tutto
DROP POLICY IF EXISTS "post_select_public" ON post;
CREATE POLICY "post_select_public" ON post FOR SELECT
  USING (
    published = true
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy INSERT: solo admin
DROP POLICY IF EXISTS "post_insert_admin" ON post;
CREATE POLICY "post_insert_admin" ON post FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy UPDATE: solo admin
DROP POLICY IF EXISTS "post_update_admin" ON post;
CREATE POLICY "post_update_admin" ON post FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy DELETE: solo admin
DROP POLICY IF EXISTS "post_delete_admin" ON post;
CREATE POLICY "post_delete_admin" ON post FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
