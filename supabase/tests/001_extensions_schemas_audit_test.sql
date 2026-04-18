begin;
select plan(37);
-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------
select has_extension('pgcrypto', 'pgcrypto extension exists');
select has_extension('pg_trgm', 'pg_trgm extension exists');
-- ---------------------------------------------------------------------------
-- ESQUEMAS Y ROLES
-- ---------------------------------------------------------------------------
select has_schema('audit', 'audit schema exists');
select has_role('app_admin', 'app_admin role exists');
select has_role('app_user', 'app_user role exists');
-- ---------------------------------------------------------------------------
-- PERMISOS SOBRE SCHEMAS
-- ---------------------------------------------------------------------------
select schema_privs_are(
        'public',
        'authenticated',
        array ['USAGE'],
        'authenticated has only USAGE on public schema'
    );
select schema_privs_are(
        'public',
        'app_admin',
        array ['USAGE'],
        'app_admin has only USAGE on public schema'
    );
select schema_privs_are(
        'public',
        'app_user',
        array ['USAGE'],
        'app_user has only USAGE on public schema'
    );
select schema_privs_are(
        'audit',
        'app_admin',
        array ['USAGE'],
        'app_admin has USAGE on audit schema'
    );
-- ---------------------------------------------------------------------------
-- TABLA DE AUDITORÍA
-- ---------------------------------------------------------------------------
select has_table(
        'audit',
        'audit_log',
        'audit.audit_log table exists'
    );
select has_column(
        'audit',
        'audit_log',
        'id',
        'audit_log.id exists'
    );
select has_column(
        'audit',
        'audit_log',
        'schema_name',
        'audit_log.schema_name exists'
    );
select has_column(
        'audit',
        'audit_log',
        'table_name',
        'audit_log.table_name exists'
    );
select has_column(
        'audit',
        'audit_log',
        'record_id',
        'audit_log.record_id exists'
    );
select has_column(
        'audit',
        'audit_log',
        'operation',
        'audit_log.operation exists'
    );
select has_column(
        'audit',
        'audit_log',
        'old_data',
        'audit_log.old_data exists'
    );
select has_column(
        'audit',
        'audit_log',
        'new_data',
        'audit_log.new_data exists'
    );
select has_column(
        'audit',
        'audit_log',
        'changed_by',
        'audit_log.changed_by exists'
    );
select has_column(
        'audit',
        'audit_log',
        'changed_at',
        'audit_log.changed_at exists'
    );
select has_column(
        'audit',
        'audit_log',
        'ip_address',
        'audit_log.ip_address exists'
    );
select has_column(
        'audit',
        'audit_log',
        'user_agent',
        'audit_log.user_agent exists'
    );
select col_is_pk(
        'audit',
        'audit_log',
        'id',
        'audit_log.id is the primary key'
    );
-- ---------------------------------------------------------------------------
-- RLS Y POLÍTICA
-- ---------------------------------------------------------------------------
select results_eq(
        $$
        select relrowsecurity
        from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'audit'
            and c.relname = 'audit_log' $$,
            $$
        values (true) $$,
            'audit.audit_log has RLS enabled'
    );
select policies_are(
        'audit',
        'audit_log',
        array ['audit_log_admin_read'],
        'audit.audit_log has exactly the expected policies'
    );
select policy_roles_are(
        'audit',
        'audit_log',
        'audit_log_admin_read',
        array ['app_admin'],
        'audit_log_admin_read applies only to app_admin'
    );
select policy_cmd_is(
        'audit',
        'audit_log',
        'audit_log_admin_read',
        'SELECT',
        'audit_log_admin_read is a SELECT policy'
    );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
        'audit',
        'audit_log',
        'audit_log_table_record_idx',
        'audit_log_table_record_idx exists'
    );
select has_index(
        'audit',
        'audit_log',
        'audit_log_changed_by_idx',
        'audit_log_changed_by_idx exists'
    );
select has_index(
        'audit',
        'audit_log',
        'audit_log_changed_at_idx',
        'audit_log_changed_at_idx exists'
    );
select has_index(
        'audit',
        'audit_log',
        'audit_log_operation_idx',
        'audit_log_operation_idx exists'
    );
-- ---------------------------------------------------------------------------
-- FUNCIONES
-- ---------------------------------------------------------------------------
select has_function(
        'public',
        'set_updated_at',
        'public.set_updated_at exists'
    );
select is_definer(
        'public',
        'set_updated_at',
        'public.set_updated_at is SECURITY DEFINER'
    );
select function_returns(
        'public',
        'set_updated_at',
        'trigger',
        'public.set_updated_at returns trigger'
    );
select has_function(
        'audit',
        'log_changes',
        'audit.log_changes exists'
    );
select is_definer(
        'audit',
        'log_changes',
        'audit.log_changes is SECURITY DEFINER'
    );
select function_returns(
        'audit',
        'log_changes',
        'trigger',
        'audit.log_changes returns trigger'
    );
select has_function(
        'audit',
        'enable_audit',
        array ['text', 'text'],
        'audit.enable_audit(text, text) exists'
    );
select *
from finish();
rollback;