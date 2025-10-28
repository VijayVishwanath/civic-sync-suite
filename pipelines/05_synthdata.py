#!/usr/bin/env python3
"""Generate 50k synthetic municipal tickets for testing"""
import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any

CATEGORIES = ["Sanitation", "Road Maintenance", "Street Lighting", "Water Supply", 
              "Waste Collection", "Parks & Gardens", "Drainage", "Electricity"]
WARDS = ["Dharavi", "Bandra West", "Andheri East", "Colaba", "Powai", "Kurla", 
         "Borivali", "Malad", "Goregaon", "Vile Parle"]
CHANNELS = ["mobile_app", "web_portal", "phone_hotline", "walk_in"]
LANGUAGES = ["en", "mr", "hi"]

def hash_pii(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()[:16]

def generate_ticket(ticket_num: int) -> Dict[str, Any]:
    submitted_at = datetime.now() - timedelta(days=random.randint(0, 365))
    category = random.choice(CATEGORIES)
    
    # Simulate escalation patterns
    high_density_ward = random.choice(["Dharavi", "Kurla"])
    ward = high_density_ward if random.random() < 0.3 else random.choice(WARDS)
    
    will_escalate = (
        category in ["Sanitation", "Water Supply"] and 
        ward == high_density_ward and 
        random.random() < 0.25
    )
    
    return {
        "ticket_id": f"TICKET-2024-{ticket_num:06d}",
        "citizen_id_hash": hash_pii(f"citizen_{random.randint(1000, 9999)}"),
        "phone_hash": hash_pii(f"+91{random.randint(7000000000, 9999999999)}"),
        "submitted_at": submitted_at.isoformat(),
        "location": {
            "ward": ward,
            "pincode": f"4000{random.randint(10, 99)}",
            "lat": 19.0 + random.uniform(-0.3, 0.3),
            "lon": 72.8 + random.uniform(-0.3, 0.3)
        },
        "category": category,
        "subcategory": f"{category}_sub_{random.randint(1, 3)}",
        "description": f"Issue with {category.lower()} in {ward}. Urgent attention needed.",
        "photos": [f"gs://bucket/photo_{ticket_num}_{i}.jpg" for i in range(random.randint(0, 3))],
        "priority_claimed": random.choice(["low", "medium", "high"]),
        "language": random.choice(LANGUAGES),
        "channel": random.choice(CHANNELS),
        "_label_will_escalate": will_escalate,
        "_label_priority_score": random.uniform(0.3, 0.95) if will_escalate else random.uniform(0.1, 0.6)
    }

def main():
    tickets = [generate_ticket(i) for i in range(1, 50001)]
    
    with open("data/synthetic_tickets_50k.jsonl", "w") as f:
        for ticket in tickets:
            f.write(json.dumps(ticket) + "\n")
    
    print(f"Generated {len(tickets)} synthetic tickets")
    print(f"Escalation rate: {sum(t['_label_will_escalate'] for t in tickets) / len(tickets):.2%}")

if __name__ == "__main__":
    main()
