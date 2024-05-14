from rest_framework import serializers
from .models import EnrichmentList, EnrichmentListFiles


class EnrichmentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnrichmentList
        fields = ["id", "name", "created_by", "created_at"]


class EnrichmentListFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnrichmentListFiles
        fields = ["id", "file", "list_id", "created_by", "created_at"]
