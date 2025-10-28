# Cost Optimizations

1. **Use committed use discounts**: 3yr CUD for Vertex AI = 55% savings
2. **BigQuery slots reservation**: Flat-rate pricing for predictable workloads
3. **Dataflow shuffle service**: Reduce worker costs by 30%
4. **Cloud Storage lifecycle**: Move old data to Coldline/Archive
5. **Preemptible VMs**: Use for batch ML training (80% cost reduction)
6. **API caching**: Cache frequent queries for 5min (reduce Vertex calls)
7. **Batch predictions**: Use batch API for non-realtime scoring
8. **Regional deployment**: Single region (asia-south1) avoids egress costs

**Estimated monthly cost: ₹35,000 for 100k tickets**
