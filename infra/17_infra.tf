terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "PROJECT_ID-terraform-state"
    prefix = "municipal-ai"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_bigquery_dataset" "municipal_data" {
  dataset_id = "municipal_data"
  location   = var.region
  description = "Municipal AI platform data"
  
  access {
    role          = "OWNER"
    user_by_email = var.admin_email
  }
}

resource "google_storage_bucket" "ml_data" {
  name          = "${var.project_id}-ml-data"
  location      = var.region
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
}

resource "google_pubsub_topic" "tickets_new" {
  name = "tickets.new"
  
  message_retention_duration = "604800s" # 7 days
}

resource "google_cloud_run_service" "api" {
  name     = "municipal-api"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/municipal-api:latest"
        
        env {
          name  = "PROJECT_ID"
          value = var.project_id
        }
        
        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }
      }
      
      service_account_name = google_service_account.cloud_run.email
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "100"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_service_account" "cloud_run" {
  account_id   = "cloud-run-api"
  display_name = "Cloud Run API Service Account"
}

resource "google_project_iam_member" "cloud_run_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}
