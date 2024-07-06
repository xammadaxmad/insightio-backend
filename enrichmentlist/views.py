from django.shortcuts import render
from django.http import JsonResponse,HttpRequest
from rest_framework import generics
from .models import EnrichmentList, EnrichmentListFiles
from .serializers import EnrichmentListFileSerializer, EnrichmentListSerializer
from rest_framework.parsers import MultiPartParser,FormParser


class CreateListEnrichmentView(generics.ListCreateAPIView):
    queryset = EnrichmentList.objects.all()
    serializer_class = EnrichmentListSerializer



class DeleteUpdateEnrichmentView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EnrichmentList.objects.all()
    serializer_class = EnrichmentListSerializer
    
    
class EnrichmentListFileListCreate(generics.ListCreateAPIView):
    queryset = EnrichmentListFiles.objects.all()
    serializer_class = EnrichmentListFileSerializer
    parser_classes = (MultiPartParser, FormParser)