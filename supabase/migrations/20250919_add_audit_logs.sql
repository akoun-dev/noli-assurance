-- Création de la table des logs d'audit et d'activité
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- success, error, warning
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- Table pour les logs système
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info', -- info, warning, error, debug
  category TEXT NOT NULL, -- auth, api, database, security, etc.
  message TEXT NOT NULL,
  context JSONB,
  stack_trace TEXT,
  source_file TEXT,
  line_number INTEGER,
  function_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les logs système
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- Fonction pour logger les actions administratives
CREATE OR REPLACE FUNCTION log_admin_action(
  p_user_id UUID,
  p_user_email TEXT,
  p_user_role TEXT,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, user_email, user_role, action, entity_type, entity_id,
    description, old_values, new_values, ip_address, user_agent,
    status, error_message, metadata, created_by
  ) VALUES (
    p_user_id, p_user_email, p_user_role, p_action, p_entity_type, p_entity_id,
    p_description, p_old_values, p_new_values, p_ip_address, p_user_agent,
    p_status, p_error_message, p_metadata, p_user_id
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour logger les événements système
CREATE OR REPLACE FUNCTION log_system_event(
  p_level TEXT,
  p_category TEXT,
  p_message TEXT,
  p_context JSONB DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL,
  p_source_file TEXT DEFAULT NULL,
  p_line_number INTEGER DEFAULT NULL,
  p_function_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO system_logs (
    level, category, message, context, stack_trace,
    source_file, line_number, function_name
  ) VALUES (
    p_level, p_category, p_message, p_context, p_stack_trace,
    p_source_file, p_line_number, p_function_name
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour logger automatiquement les modifications sur certaines tables
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_action TEXT;
BEGIN
  v_action := TG_OP;

  IF TG_OP = 'UPDATE' THEN
    v_old_values := jsonb_build_object(
      'nom', OLD.nom,
      'prenom', OLD.prenom,
      'email', OLD.email,
      'role', OLD.role,
      'telephone', OLD.telephone,
      'status', OLD.status
    );

    v_new_values := jsonb_build_object(
      'nom', NEW.nom,
      'prenom', NEW.prenom,
      'email', NEW.email,
      'role', NEW.role,
      'telephone', NEW.telephone,
      'status', NEW.status
    );

    PERFORM log_admin_action(
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.current_user_email', true),
      current_setting('app.current_user_role', true),
      v_action,
      'users',
      NEW.id,
      'User information updated',
      v_old_values,
      v_new_values,
      NULL,
      NULL,
      'success',
      NULL,
      jsonb_build_object('trigger', 'user_update')
    );

  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_admin_action(
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.current_user_email', true),
      current_setting('app.current_user_role', true),
      v_action,
      'users',
      OLD.id,
      'User deleted',
      jsonb_build_object(
        'nom', OLD.nom,
        'prenom', OLD.prenom,
        'email', OLD.email,
        'role', OLD.role
      ),
      NULL,
      NULL,
      NULL,
      'success',
      NULL,
      jsonb_build_object('trigger', 'user_delete')
    );

  ELSIF TG_OP = 'INSERT' THEN
    v_new_values := jsonb_build_object(
      'nom', NEW.nom,
      'prenom', NEW.prenom,
      'email', NEW.email,
      'role', NEW.role,
      'telephone', NEW.telephone
    );

    PERFORM log_admin_action(
      current_setting('app.current_user_id', true)::UUID,
      current_setting('app.current_user_email', true),
      current_setting('app.current_user_role', true),
      v_action,
      'users',
      NEW.id,
      'New user created',
      NULL,
      v_new_values,
      NULL,
      NULL,
      'success',
      NULL,
      jsonb_build_object('trigger', 'user_insert')
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Permissions
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON system_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_event TO authenticated;

-- Politique de RLS pour les logs d'audit
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Politique de RLS pour les logs système
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system logs" ON system_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Commentaires
COMMENT ON TABLE audit_logs IS 'Table d''audit pour suivre toutes les actions administratives';
COMMENT ON TABLE system_logs IS 'Table pour les logs système et erreurs';