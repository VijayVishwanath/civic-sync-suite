# Municipal AI Platform - Architecture Quickstart

AI-powered ticket prioritization for Maharashtra municipal governance. Predicts escalations, auto-routes to departments, provides Gemini RAG chat.

## Stack
GCP: BigQuery + Vertex AI + Cloud Run + Pub/Sub + Dataflow

## Setup
1. `gcloud auth login`
2. `terraform init && terraform apply`
3. `bq mk --dataset municipal_data`
4. `python pipelines/05_synthdata.py`
5. `bq load municipal_data.raw_tickets data/synthetic_tickets_50k.jsonl`

## Privacy
DPDP Act 2023 compliant. PII hashed, RLS policies, 7yr audit trail.

## Metrics
AUC ≥0.75 | Latency <200ms | Cost: ₹35k/month for 100k tickets
