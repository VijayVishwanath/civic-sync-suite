# Demo Storyboard

## Scenario: Urgent Sanitation Issue in Dharavi

1. **Citizen submits ticket** via mobile app (Marathi language)
2. **System ingests** → PII hashed → Dataflow enrichment
3. **ML model scores** ticket: 0.92 (HIGH priority)
4. **Auto-routes** to Sanitation dept + alerts supervisor
5. **Staff dashboard** shows rationale: "High density + previous escalations"
6. **Resolution** tracked → feedback loop updates model

## Q&A Panel
- **Q: How accurate?** A: 85% precision on high-priority predictions
- **Q: Privacy?** A: DPDP compliant, all PII hashed, 7yr audit trail
- **Q: Cost?** A: ₹35k/month for 100k tickets
