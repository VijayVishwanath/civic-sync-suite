-- BigQuery DDL for Municipal AI Platform
-- Location: asia-south1

CREATE SCHEMA IF NOT EXISTS municipal_data
OPTIONS (
  location = 'asia-south1',
  description = 'Municipal citizen service requests'
);

-- Raw tickets table
CREATE OR REPLACE TABLE municipal_data.raw_tickets (
  ticket_id STRING NOT NULL,
  citizen_id_hash STRING,  -- SHA256 hash
  phone_hash STRING,       -- SHA256 hash
  submitted_at TIMESTAMP NOT NULL,
  ward STRING,
  pincode STRING,
  lat FLOAT64,
  lon FLOAT64,
  category STRING NOT NULL,
  subcategory STRING,
  description STRING,
  photos ARRAY<STRING>,
  priority_claimed STRING,
  language STRING,
  channel STRING,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  _dlp_scanned BOOL DEFAULT FALSE
)
PARTITION BY DATE(submitted_at)
CLUSTER BY category, ward
OPTIONS (
  description = 'Raw citizen tickets with PII hashed',
  require_partition_filter = TRUE
);

-- Add policy tags for PII
-- Note: Policy tags must be created separately in Data Catalog
ALTER TABLE municipal_data.raw_tickets 
  ALTER COLUMN citizen_id_hash SET OPTIONS (policy_tags=('projects/PROJECT_ID/locations/asia-south1/taxonomies/TAXONOMY_ID/policyTags/PII_HIGH')),
  ALTER COLUMN phone_hash SET OPTIONS (policy_tags=('projects/PROJECT_ID/locations/asia-south1/taxonomies/TAXONOMY_ID/policyTags/PII_HIGH'));

-- Cleansed tickets
CREATE OR REPLACE TABLE municipal_data.cleansed_tickets (
  ticket_id STRING NOT NULL,
  citizen_id_hash STRING,
  submitted_at TIMESTAMP NOT NULL,
  ward STRING NOT NULL,
  pincode STRING,
  lat FLOAT64,
  lon FLOAT64,
  category STRING NOT NULL,
  subcategory STRING,
  description_clean STRING,
  photo_count INT64,
  language STRING,
  channel STRING,
  sentiment_score FLOAT64,
  cleansed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(submitted_at)
CLUSTER BY category, ward;

-- Feature table for ML
CREATE OR REPLACE TABLE municipal_data.ml_features (
  ticket_id STRING NOT NULL,
  submitted_at TIMESTAMP NOT NULL,
  
  -- Ticket features
  category STRING,
  hour_of_day INT64,
  day_of_week INT64,
  is_weekend BOOL,
  description_length INT64,
  photo_count INT64,
  
  -- Ward features
  ward STRING,
  population_density FLOAT64,
  ward_tickets_7d INT64,
  ward_tickets_30d INT64,
  ward_escalation_rate_7d FLOAT64,
  ward_avg_response_time_7d FLOAT64,
  vip_constituency BOOL,
  
  -- Historical features
  citizen_previous_tickets_30d INT64,
  citizen_previous_escalations INT64,
  category_escalation_rate_30d FLOAT64,
  
  -- Label
  will_escalate BOOL,
  priority_score FLOAT64,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(submitted_at)
CLUSTER BY category, ward;

-- Audit logs table (7yr retention)
CREATE OR REPLACE TABLE municipal_data.audit_logs (
  audit_id STRING NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,
  ticket_id STRING,
  user_id STRING,
  action STRING NOT NULL,
  model_version STRING,
  model_score FLOAT64,
  input_hash STRING,
  explanation JSON,
  ip_address STRING,
  session_id STRING,
  consent_version STRING
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY action, ticket_id
OPTIONS (
  partition_expiration_days = 2555,  -- 7 years
  description = 'Audit trail for all ML predictions and actions'
);

-- Row-level security example
CREATE OR REPLACE ROW ACCESS POLICY staff_rls
ON municipal_data.cleansed_tickets
GRANT TO ('group:staff@municipality.gov.in')
FILTER USING (TRUE);

CREATE OR REPLACE ROW ACCESS POLICY citizen_rls
ON municipal_data.cleansed_tickets
GRANT TO ('group:citizens@municipality.gov.in')
FILTER USING (citizen_id_hash = SESSION_USER());

-- Column masking (requires separate policy creation)
-- CREATE OR REPLACE MASKING POLICY mask_pii AS (val STRING) RETURNS STRING -> 
--   CASE 
--     WHEN SESSION_USER() IN ('ml-service@project.iam.gserviceaccount.com') THEN val
--     ELSE 'MASKED'
--   END;
