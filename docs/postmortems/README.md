# ForgeLens Postmortems

*The strongest engineering organizations don't avoid mistakes. They become impossible to surprise twice.*

Every production failure requires a Postmortem documented in this directory (`PM-XXXX.md`).

## Postmortem Structure

```markdown
# PM-XXXX: [Short Description of Incident]

## Root Cause
[What exactly failed?]

## Detection
[How did we find out? Was it an alert or a user report?]

## Impact
[Who was affected and for how long?]

## Timeline
[Chronological events from the incident start to resolution.]

## Fix
[The immediate patch.]

## Prevention
[The systemic fix, test, or alarm added to ensure this never happens again.]
```
