from django.contrib import admin
from .models import EnrichmentList,EnrichmentListFiles

admin.site.register(EnrichmentList)
admin.site.register(EnrichmentListFiles)