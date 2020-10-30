from django.urls import path, include
from . import views

urlpatterns = [
	path('get-pretrained-model/', views.GetPreTrainedModel),
	path('get-model/<str:token>/', views.GetModel),
	path('get-image/', views.GetImage),
	path('get-file/', views.GetFile),
	path('get-model-file/', views.GetModelFile),
	path('get-weight-file/', views.GetWeightFile),	
]
