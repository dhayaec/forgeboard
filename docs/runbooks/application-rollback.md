# Application Rollback Runbook

## Purpose

Roll back a broken ECS/Fargate deployment to the previous stable task definition.

## Indicators for Rollback

- Error rate > 5% for > 5 minutes
- Health checks failing after deploy
- P99 latency > 10s
- Critical feature completely broken
- Security vulnerability introduced

## Quick Rollback (ECS)

```bash
# 1. Get previous task definition
aws ecs describe-task-definition --task-definition forgeboard --query 'taskDefinition.taskDefinitionArn'

# 2. List revisions (find the previous one)
aws ecs list-task-definitions --family forgeboard --sort DESC

# 3. Update service to previous revision
aws ecs update-service \
  --cluster forgeboard-prod \
  --service forgeboard-prod \
  --task-definition forgeboard:42 \
  --force-new-deployment

# 4. Monitor health
aws ecs wait services-stable \
  --cluster forgeboard-prod \
  --services forgeboard-prod
```

## Rollback via GitHub Actions

If using the CI pipeline, trigger the workflow with the previous commit SHA:

1. Go to GitHub Actions → Deploy Production
2. Click "Run workflow"
3. Enter the previous commit SHA (e.g. `abc1234`)
4. Monitor deployment

## Verify Rollback

```bash
# Check ECS service events
aws ecs describe-services \
  --cluster forgeboard-prod \
  --services forgeboard-prod \
  --query 'services[0].events[:5]'

# Check application logs
aws logs tail /ecs/forgeboard --since 30m

# Hit health endpoint
curl -f https://api.forgeboard.example/api/health
```

## Post-Rollback

1. Open incident ticket
2. Notify affected users if there's downtime
3. Do NOT redeploy until root cause identified
4. Update status page

## Contacts

- On-call: PagerDuty
- Infra: [Slack #infra]
- Product: [Slack #announcements]
