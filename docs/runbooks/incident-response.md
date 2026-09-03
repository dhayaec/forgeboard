# Incident Response Runbook

## Severity Levels

| Level | Definition                          | Response Time | Example                          |
| ----- | ----------------------------------- | ------------- | -------------------------------- |
| P1    | Complete outage, data loss          | 15 min       | DB down, all users blocked       |
| P2    | Major feature broken, >25% affected  | 30 min       | Login broken, can't create tasks  |
| P3    | Minor feature broken, workaround     | 2 hours      | Search slow, PDF export fails    |
| P4    | Cosmetic, low impact                | 24 hours     | Wrong color, minor UI glitch     |

## Incident Lifecycle

```
Detect → Triage → Communicate → Mitigate → Resolve → Postmortem
```

## Step 1: Detect

- Alert fires in PagerDuty
- User report in #support
- Internal report

## Step 2: Triage

```bash
# Quick health check
curl -f https://api.forgeboard.example/api/health
curl -f https://api.forgeboard.example/api/ready

# Check ECS service
aws ecs describe-services \
  --cluster forgeboard-prod \
  --services forgeboard-prod

# Check recent deployments
aws ecs list-tasks --cluster forgeboard-prod --service forgeboard-prod
```

## Step 3: Communicate

1. Post in #incidents: "Investigating [symptom]"
2. Update status page if P1/P2
3. Set expected resolution time

## Step 4: Mitigate

Common mitigations:
- **High error rate after deploy** → Rollback (see application-rollback.md)
- **Database slow** → Check connection pool, long queries
- **Redis down** → Fall back to no-cache mode, alert
- **S3 upload failures** → Check bucket policy, IAM role
- **Auth failures** → Check Auth.js secret, session store

## Step 5: Resolve

- Deploy fix or confirm rollback succeeded
- Verify health checks pass
- Update status page to "Resolved"
- Notify stakeholders

## Step 6: Postmortem

Within 48 hours of P1/P2:

1. Create postmortem document
2. Timeline of events (UTC timestamps)
3. Root cause analysis
4. Impact assessment (users affected, downtime)
5. Action items with owners and due dates
6. Share in #incidents

### Postmortem Template

```markdown
# Incident Postmortem — [Date]

## Summary
[1-2 sentence description]

## Severity: P1/P2

## Timeline (UTC)
- HH:MM — Alert fired
- HH:MM — Investigating
- HH:MM — Mitigation applied
- HH:MM — Resolved

## Root Cause
[Technical root cause]

## Impact
- X users affected
- Y minutes of downtime

## Action Items
| Action | Owner | Due |
|--------|-------|-----|
| Fix X | @name | date |

## Lessons Learned
[What went well, what didn't]
```

## Contacts

- P1/P2: On-call engineer + Engineering Manager
- All incidents: #incidents channel
- External comms: Comms team via #announcements
