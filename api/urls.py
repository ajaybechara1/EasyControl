from django.urls import path, include
from . import views

urlpatterns = [
	path('get-pretrained-model/', views.GetPreTrainedModel),
	path('get-model/<str:token>/', views.GetModel),
	path('create-user-token/', views.CreateUserToken),
	path('upload-images-with-token/', views.UploadImageWithToken),
	path('upload-images-data/', views.UploadImagePage),
	path('predict-gestures/', views.PredictGestures),
	path('train-model-with-token/', views.TrainModelWithToken),
	path('upload-model/', views.UploadModel),
	path('upload-model-with-token/', views.UploadModelWithToken),
	path('', views.UploadImagePage),
]
