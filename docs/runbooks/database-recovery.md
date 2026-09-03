# Database Recovery Runbook

## Purpose

Restore PostgreSQL to a known-good state after corruption, data loss, or before major migrations.

## When to Use

- Database corruption detected (checksum failures, missing rows)
- Failed migration that needs rollback
- Accidental data deletion
- Disaster recovery procedure

## Step 1: Assess

```bash
# Check database health
docker compose exec postgres pg_isready

# Check connection count
docker compose exec postgres psql -U forgeboard -d forgeboard -c "SELECT count(*) FROM pg_stat_activity;"

# Check replication lag (if applicable)
docker compose exec postgres psql -U postgres -c "SELECT now() - pg_last_xact_replay_timestamp() AS lag;"
```

## Step 2: Point-in-Time Recovery (Production)

If using RDS with automated backups:

```bash
# 1. Identify recovery point from CloudWatch RDS metrics or backup list
aws rds describe-db-snapshots --db-instance-identifier forgeboard-prod

# 2. Restore to a new instance (do NOT restore over production)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier forgeboard-recovered \
  --db-snapshot-identifier <snapshot-arn> \
  --db-instance-class db.t3.medium \
  --no-multi-az

# 3. Wait for restoration
aws rds wait db-instance-available --db-instance-identifier forgeboard-recovered

# 4. Update connection string in Secrets Manager
# 5. Run verification queries
# 6. Promote to primary when verified
```

## Step 3: Local Development Reset

```bash
# WARNING: Destroys all local data
docker compose down -v postgres
docker compose up -d postgres

# Re-run migrations
pnpm prisma migrate deploy

# Optionally re-seed
pnpm prisma db seed
```

## Step 4: Verify

```sql
-- Check expected tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check row counts
SELECT 'users' as table, count(*) FROM "User"
UNION ALL SELECT 'organizations', count(*) FROM "Organization"
UNION ALL SELECT 'tasks', count(*) FROM "Task";

-- Check recent audit logs
SELECT "createdAt", "action", "entityType" FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 10;
```

## Rollback a Migration

```bash
# Revert to previous migration
pnpm prisma migrate resolve --rolled-back <migration-name>

# Or reset entirely (destructive)
pnpm prisma migrate reset
```

## Contacts

- DBA/Infra Team: [Slack #infra]
- On-call: PagerDuty
