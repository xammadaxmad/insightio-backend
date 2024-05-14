from django.db import models

class EnrichmentList(models.Model):
    name = models.TextField()
    created_by = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "enrichment_list"
        
        
class EnrichmentListFiles(models.Model):
    file = models.FileField(upload_to="storage")
    list_id = models.IntegerField()
    created_by = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "enrichment_list_files"
