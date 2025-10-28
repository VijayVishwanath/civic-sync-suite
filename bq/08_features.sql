-- Feature engineering queries for ML training

-- Rolling ward aggregates (7d, 30d windows)
CREATE OR REPLACE TABLE municipal_data.ward_aggregates_7d AS
SELECT
  ward,
  DATE(submitted_at) AS feature_date,
  COUNT(*) AS total_tickets_7d,
  AVG(CASE WHEN will_escalate THEN 1.0 ELSE 0.0 END) AS escalation_rate_7d,
  AVG(resolution_time_hours) AS avg_response_time_7d,
  COUNT(DISTINCT citizen_id_hash) AS unique_citizens_7d
FROM municipal_data.cleansed_tickets
WHERE submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY ward, feature_date;

-- Category escalation patterns
CREATE OR REPLACE TABLE municipal_data.category_stats_30d AS
SELECT
  category,
  DATE(submitted_at) AS feature_date,
  COUNT(*) AS total_tickets_30d,
  AVG(CASE WHEN will_escalate THEN 1.0 ELSE 0.0 END) AS escalation_rate_30d,
  APPROX_QUANTILES(priority_score, 100)[OFFSET(50)] AS median_priority,
  APPROX_QUANTILES(priority_score, 100)[OFFSET(95)] AS p95_priority
FROM municipal_data.cleansed_tickets
WHERE submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY category, feature_date;

-- Citizen historical behavior
CREATE OR REPLACE TABLE municipal_data.citizen_history AS
SELECT
  citizen_id_hash,
  COUNT(*) AS total_tickets_lifetime,
  COUNT(CASE WHEN submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) THEN 1 END) AS tickets_30d,
  SUM(CASE WHEN will_escalate THEN 1 ELSE 0 END) AS total_escalations,
  AVG(priority_score) AS avg_priority_score,
  MAX(submitted_at) AS last_ticket_date
FROM municipal_data.cleansed_tickets
GROUP BY citizen_id_hash;

-- Sentiment analysis UDF (placeholder - integrate with Gemini API)
CREATE OR REPLACE FUNCTION municipal_data.analyze_sentiment(text STRING)
RETURNS FLOAT64
LANGUAGE js AS """
  // Placeholder: Call Gemini API or use simple heuristics
  const negativeWords = ['urgent', 'emergency', 'danger', 'complaint'];
  const score = negativeWords.some(w => text.toLowerCase().includes(w)) ? 0.3 : 0.7;
  return score;
""";

-- Final ML feature table generation
CREATE OR REPLACE TABLE municipal_data.ml_training_features AS
SELECT
  t.ticket_id,
  t.submitted_at,
  
  -- Ticket attributes
  t.category,
  t.subcategory,
  EXTRACT(HOUR FROM t.submitted_at) AS hour_of_day,
  EXTRACT(DAYOFWEEK FROM t.submitted_at) AS day_of_week,
  CASE WHEN EXTRACT(DAYOFWEEK FROM t.submitted_at) IN (1, 7) THEN TRUE ELSE FALSE END AS is_weekend,
  LENGTH(t.description_clean) AS description_length,
  t.photo_count,
  t.sentiment_score,
  
  -- Ward features
  t.ward,
  w.total_tickets_7d,
  w.escalation_rate_7d,
  w.avg_response_time_7d,
  w.unique_citizens_7d,
  
  -- Category features
  c.escalation_rate_30d AS category_escalation_rate_30d,
  c.median_priority AS category_median_priority,
  
  -- Citizen features
  ch.total_tickets_lifetime,
  ch.tickets_30d AS citizen_tickets_30d,
  ch.total_escalations AS citizen_escalations,
  ch.avg_priority_score AS citizen_avg_priority,
  
  -- Labels
  t.will_escalate,
  t.priority_score

FROM municipal_data.cleansed_tickets t
LEFT JOIN municipal_data.ward_aggregates_7d w
  ON t.ward = w.ward 
  AND DATE(t.submitted_at) = w.feature_date
LEFT JOIN municipal_data.category_stats_30d c
  ON t.category = c.category 
  AND DATE(t.submitted_at) = c.feature_date
LEFT JOIN municipal_data.citizen_history ch
  ON t.citizen_id_hash = ch.citizen_id_hash
WHERE t.submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY);

-- Export to GCS for Vertex AI training
EXPORT DATA OPTIONS(
  uri='gs://PROJECT_ID-ml-data/features/training_*.csv',
  format='CSV',
  overwrite=true,
  header=true
) AS
SELECT * FROM municipal_data.ml_training_features;
