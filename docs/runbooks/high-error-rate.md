# High Error Rate Runbook

## Purpose

Investigate and resolve elevated error rates (> threshold) in production.

## Detection

CloudWatch Alarm: `ForgeBoard-Prod-ErrorRate` fires → PagerDuty alert.

## Step 1: Confirm

```bash
# Check application logs for errors
aws logs filter-log-events \
  --log-group-name /ecs/forgeboard-prod \
  --start-time $(date -d '30 minutes ago' +%s000) \
  --filter-pattern "ERROR"

# Check for specific error codes
aws logs filter-log-events \
  --log-group-name /ecs/forgeboard-prod \
  --filter-pattern "[error, requestId, message]"

# Check ECS service events
aws ecs describe-services \
  --cluster forgeboard-prod \
  --services forgeboard-prod \
  --query 'services[0].events[:10]'
```

## Step 2: Identify Pattern

- **All endpoints** → Infrastructure issue (DB, Redis, network)
- **Auth endpoints** → Auth.js secret rotation, session store issue
- **Specific endpoint** → Code bug in that handler
- **Write operations** → Database constraint, migration issue
- **External calls** → Third-party API issue

## Step 3: Common Causes

### Database connection exhaustion
```sql
-- Check from within the container
docker compose exec postgres psql -U forgeboard -d forgeboard -c "
  SELECT count(*) as active_connections,
         count(*) FILTER (WHERE state = 'active') as active
  FROM pg_stat_activity;
"
-- Max connections: check `max_connections` in RDS parameter group
```

**Fix:** Reduce pool size, increase `max_connections`, or scale the service.

### Slow queries
```bash
# Find slow queries
docker compose exec postgres psql -U postgres -c "
  SELECT query, calls, mean_time, total_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

**Fix:** Add index, optimize query, or add pagination.

### Memory pressure / OOM
```bash
# Check container memory
aws ecs describe-tasks \
  --cluster forgeboard-prod \
  --tasks <task-arn> \
  --query 'tasks[0].containers[0].memory'

# Check ECS service metrics in CloudWatch
```

**Fix:** Increase memory in task definition, profile memory usage.

### Prisma migration failure
```bash
# Check pending migrations
pnpm prisma migrate status

# Check migration logs
aws logs filter-log-events \
  --log-group-name /ecs/forgeboard-prod \
  --filter-pattern "migration"
```

**Fix:** Roll forward with fix, or roll back migration.

### New deployment with bug
Check the deployment timeline in ECS events.

**Fix:** Rollback to previous task definition (see application-rollback.md).

## Step 4: Mitigate

1. If recent deploy → Rollback first
2. If infrastructure → Fix or scale
3. If code bug → Deploy hotfix
4. Monitor for 15 minutes after fix

## Step 5: Document

Update the incident ticket with findings and resolution.
