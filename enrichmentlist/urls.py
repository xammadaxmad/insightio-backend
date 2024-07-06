from django.urls import path
from . import views

urlpatterns = [
    path("list/",view=views.CreateListEnrichmentView.as_view()),
    path("list/<int:pk>/",view=views.DeleteUpdateEnrichmentView.as_view()),
    path("files/",view=views.EnrichmentListFileListCreate.as_view()),
]