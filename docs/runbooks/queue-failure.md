# Queue Failure Runbook

## Purpose

Investigate and resolve background job queue failures, stuck jobs, or queue service unavailability.

## Symptoms

- Jobs not processing (email not sent, report not generated)
- Job queue depth in CloudWatch increasing
- Error rate on job workers elevated
- "Queue is unavailable" errors in application logs

## Step 1: Assess

```bash
# Check Redis connection
docker compose exec redis redis-cli ping
# Should return: PONG

# Check queue depth
docker compose exec redis redis-cli LLEN bull:forgeboard:wait
docker compose exec redis redis-cli LLEN bull:forgeboard:failed

# Check for stuck workers
docker compose ps
```

## Step 2: Common Issues

### Redis unavailable
```bash
# Check Redis logs
docker compose logs redis

# Restart Redis
docker compose restart redis

# Verify
docker compose exec redis redis-cli ping
```

### Worker crash loop
Check worker logs:
```bash
docker compose logs worker | tail -100
```

Common causes:
- Environment variable missing
- Database connection issue
- Unhandled exception in job handler

### Job dead-letter queue filling
```bash
# Inspect failed jobs
docker compose exec redis redis-cli LRANGE bull:forgeboard:failed 0 10

# Get job details
docker compose exec redis redis-cli JSON.GET bull:forgeboard:<job-id>
```

## Step 3: Fix Actions

### Retry all failed jobs
```bash
# Using BullMQ CLI (after connecting to Redis)
docker compose exec worker node scripts/retry-failed.ts
```

### Clear stuck queue (DANGER - only for development)
```bash
docker compose exec redis redis-cli DEL bull:forgeboard:wait bull:forgeboard:failed
```

### Restart workers
```bash
docker compose restart worker
```

### Scale workers
```bash
# Update desired count in ECS
aws ecs update-service \
  --cluster forgeboard-prod \
  --service forgeboard-worker-prod \
  --desired-count 3
```

## Step 4: Monitor

After restart/fix:
- Watch queue depth in CloudWatch (should decrease)
- Watch error rate (should normalize)
- Check that jobs are completing (check job status in DB)

## Step 5: Prevention

- Worker health checks
- Dead letter queue monitoring (alarm if DLQ > 100)
- Alert on queue depth > 1000
- Alert on worker crash loops
- Graceful shutdown handling in worker code

## Contacts

- On-call: PagerDuty
- Infra: #infra channel
