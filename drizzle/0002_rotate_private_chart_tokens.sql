BEGIN;

DO $$
DECLARE
  fk RECORD;
  definition TEXT;
BEGIN
  FOR fk IN
    SELECT con.oid, con.conname, con.conrelid::regclass AS table_name
    FROM pg_constraint con
    WHERE con.contype = 'f'
      AND con.confrelid = 'charts'::regclass
  LOOP
    definition := pg_get_constraintdef(fk.oid);
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.table_name, fk.conname);
    definition := regexp_replace(
      definition,
      ' REFERENCES charts\(slug\)',
      ' REFERENCES charts(slug) ON UPDATE CASCADE'
    );
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', fk.table_name, fk.conname, definition);
  END LOOP;
END
$$;

UPDATE charts
SET slug = replace(gen_random_uuid()::text, '-', '');

COMMIT;
