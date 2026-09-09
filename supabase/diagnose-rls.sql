-- Diagnostic: run this and paste back the full JSON result.

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'listings';

select grantee, privilege_type
from information_schema.role_table_grants
where table_name = 'listings';
