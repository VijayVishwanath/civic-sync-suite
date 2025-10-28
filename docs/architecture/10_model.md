# ML Model Specification

## Model Overview
**Name:** Municipal Ticket Priority Predictor  
**Type:** Supervised Regression + Classification  
**Algorithm:** XGBoost Ensemble  
**Framework:** Vertex AI Custom Training  

## Objective
Predict two targets:
1. **Priority Score** (0.0-1.0): Composite urgency metric
2. **Will Escalate** (binary): Likelihood of escalation within 48hrs

## Training Data
- **Source:** BigQuery `municipal_data.ml_training_features`
- **Size:** 50k+ historical tickets (3+ months)
- **Split:** 70% train, 15% validation, 15% test
- **Sampling:** Stratified by category and escalation label
- **Features:** 20 features (ticket, ward, category, citizen history)

## Feature Importance (Expected Top 5)
1. `ward_escalation_rate_7d` (0.22)
2. `category_escalation_rate_30d` (0.18)
3. `citizen_escalations` (0.15)
4. `ward_avg_response_time_7d` (0.12)
5. `hour_of_day` (0.08)

## Performance Targets
| Metric | Target | Production Threshold |
|--------|--------|---------------------|
| AUC (escalation) | ≥0.75 | ≥0.70 |
| RMSE (priority) | ≤0.15 | ≤0.20 |
| Precision@K (top 100) | ≥0.85 | ≥0.80 |
| Latency (p95) | <200ms | <500ms |

## Explainability
- **Method:** SHAP (SHapley Additive exPlanations)
- **Output:** Top 3 feature contributions per prediction
- **Storage:** Audit log JSON field
- **UI Display:** Staff dashboard shows rationale

## Fairness Constraints
- **Ward Bias:** Δ(escalation_rate) across wards ≤5%
- **Language Bias:** Δ(priority_score) across languages ≤0.05
- **Monitoring:** Monthly bias report

## Model Versioning
- **Registry:** Vertex AI Model Registry
- **Naming:** `ticket-priority-vYYYYMMDD`
- **Rollback:** Keep last 3 versions deployed (canary traffic)

## Retraining Schedule
- **Frequency:** Weekly (automated pipeline)
- **Trigger:** Drift detection alert OR manual approval
- **Data Window:** Rolling 90 days
- **Validation:** Shadow deployment for 48hrs before promotion

## Monitoring & Drift Detection
### Input Drift
- Monitor feature distribution shift (KL divergence)
- Alert if KL > 0.1 for critical features

### Output Drift
- Track prediction distribution
- Alert if mean priority score shifts >10%

### Performance Decay
- Track live AUC via feedback loop
- Retrain if AUC drops below 0.70

## A/B Testing
- **Framework:** Cloud Run traffic split
- **Metrics:** AUC, latency, user satisfaction
- **Duration:** 7 days minimum
- **Decision:** Promote if new model AUC +2% and latency <10% increase
