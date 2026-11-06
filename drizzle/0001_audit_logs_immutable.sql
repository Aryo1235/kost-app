-- Audit log tidak boleh diubah atau dihapus (FR-AUD-04, TECH-SPEC 3.7).
-- Ini jaring kedua di atas repository yang hanya punya insert dan list.
CREATE OR REPLACE FUNCTION audit_logs_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs tidak boleh diubah atau dihapus'
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update_delete
  BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();
