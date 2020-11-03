from django.shortcuts import render
from django.http import JsonResponse, FileResponse, HttpResponse
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets

from .models import UserObject
from .utils import *

import sys
import os
from os import path
import base64
import json
import shutil
import threading

import logging
logger = logging.getLogger(__name__)

TRAINING_DATASET_PATH = settings.TRAINING_DATASET_PATH

@api_view(['GET'])
def GetModel(request, token):
	response = {
		'status' : 200
	}
	try:
		logger.info("GetModel token : %s", str(token), extra={'AppName': 'API'})
		token_path = TRAINING_DATASET_PATH + token

		gesture_name_list = os.listdir(token_path + "/train_grey")

		storage_model_path = TRAINING_DATASET_PATH + token + "/model/model.json"
		storage_weight_path = TRAINING_DATASET_PATH + token + "/model/group1-shard1of1.bin"

		model_path = 'files/trained_models/' + token + "/model.json"
		weight_path = 'files/trained_models/' + token + "/group1-shard1of1.bin"

		if not os.path.exists('files/trained_models/' + token):
			os.makedirs('files/trained_models/' + token)

		shutil.copy(storage_model_path, model_path)
		shutil.copy(storage_weight_path, weight_path)
		
		if not path.exists(model_path):
			response['status'] = 401
			response['message'] = 'model file not exist'
			logger.info("GetModel %s", str(response['status']) + response['message'], extra={'AppName': 'API'})
			return Response(response)

		if not path.exists(weight_path):
			response['status'] = 402
			response['message'] = 'weight file not exist'
			logger.info("GetModel %s", str(response['status']) + response['message'], extra={'AppName': 'API'})
			return Response(response)

		HTTP_HOST = request.META['HTTP_HOST']
		model_url = "https://" + settings.MY_PUBLIC_IP + "/" + model_path
		# model_url = "http://" + "127.0.0.1:8000" + "/" + model_path
		
		response['model_url'] = model_url
		response['gesture_name_list'] = gesture_name_list

	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("GetModel %s at line %s", str(exc_tb.tb_lineno), str(e), extra={'AppName': 'API'})
	return Response(response)

@api_view(['POST'])
def CreateUserToken(request):
	response = {
		'status' : 200
	}
	try:
		user_object = UserObject.objects.create()
		response['user_token'] = user_object.user_token
		logger.info("CreateUserToken token generated : %s", str(user_object.user_token), extra={'AppName': 'API'})
	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("CreateUserToken %s at line %s", str(e), str(exc_tb.tb_lineno), extra={'AppName': 'API'})

	return Response(response)

@api_view(['POST'])
def UploadImageWithToken(request):
	response = {
		'status' : 200
	}
	try:
		data = json.loads(request.data['data'])
		user_token = data['user_token']

		logger.info("UploadImageWithToken token : %s", str(user_token), extra={'AppName': 'API'})

		index_start = int(data['index'])
		captured_image_dictionary = json.loads(data['captured_image_dictionary'])

		token_specific_path = TRAINING_DATASET_PATH + user_token

		try:
			if not os.path.exists(token_specific_path):
			    os.makedirs(token_specific_path)

			train_data_specific_path = token_specific_path + "/train"
			if not os.path.exists(train_data_specific_path):
			    os.makedirs(train_data_specific_path)

			test_data_specific_path = token_specific_path + "/test"
			if not os.path.exists(test_data_specific_path):
			    os.makedirs(test_data_specific_path)
		except Exception as e:
			exc_type, exc_obj, exc_tb = sys.exc_info()
			logger.error("UploadImageWithToken path create %s at line %s", str(e), str(exc_tb.tb_lineno), extra={'AppName': 'API'})

		for gesture_name, image_list in captured_image_dictionary.items():

			gesture_specific_path = train_data_specific_path + "/" + gesture_name
			if not os.path.exists(gesture_specific_path):
			    os.makedirs(gesture_specific_path)

			index = index_start
			for image_data in image_list:
				image_specific_path = gesture_specific_path + '/' + str(index) + ".png"
				with open(image_specific_path, "wb") as file_handler:
					image_data = image_data.split(',')[-1]
					file_handler.write(base64.b64decode(image_data))
				index += 1

	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("UploadImageWithToken %s at line %s", str(e), str(exc_tb.tb_lineno), extra={'AppName': 'API'})

	return Response(response)

def UploadImagePage(request):
	return render(request, 'api/upload_image_page.html')

def PredictGestures(request):
	return render(request, 'api/predict_page.html')

@api_view(['POST'])
def TrainModelWithToken(request):
	response = {
		'status' : 200
	}
	try:
		data = request.data
		user_token = data['user_token']
		
		logger.info("TrainModelWithToken token : %s", str(user_token), extra={'AppName': 'API'})

		# train_model_with_token(user_token)
		thread_process = threading.Thread(target=train_model_with_token, args=(user_token,))
		# thread_process.daemon = True
		thread_process.start()

	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("TrainModelWithToken %s at line %s", str(e), str(exc_tb.tb_lineno), extra={'AppName': 'API'})

	return Response(response)


def UploadModel(request):
	return render(request, 'api/upload_model.html')


@api_view(['POST'])
def UploadModelWithToken(request):
	response = {
		'status' : 200
	}
	try:
		data = json.loads(request.data['data'])

		user_token = data['user_token']
		model_file_data = data['model_file']
		weight_file_data = data['weight_file']

		logger.info("UploadModelWithToken token : %s", str(user_token), extra={'AppName': 'API'})

		token_specific_path = TRAINING_DATASET_PATH + user_token

		if not os.path.exists(token_specific_path):
		    os.makedirs(token_specific_path)

		model_dir_path = token_specific_path + "/model"

		if not os.path.exists(model_dir_path):
		    os.makedirs(model_dir_path)

		model_file_path = model_dir_path + '/' + "model.json"
		weight_file_path = model_dir_path + '/' + "group1-shard1of1.bin"

		with open(model_file_path, "wb") as file_handler:
			file_handler.write(base64.b64decode(model_file_data))

		with open(weight_file_path, "wb") as file_handler:
			file_handler.write(base64.b64decode(weight_file_data))

	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("UploadModelWithToken %s at line %s", str(e), str(exc_tb.tb_lineno), extra={'AppName': 'API'})

	return Response(response)

