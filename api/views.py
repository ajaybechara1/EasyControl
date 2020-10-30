from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets

from django.http import FileResponse

import sys
import os
from os import path

import logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
def GetPreTrainedModel(request):
	response = {
		'status' : 200
	}
	try:
		HTTP_HOST = request.META['HTTP_HOST']
		model_url = "http://" + HTTP_HOST + "/files/trained_models/default/model.json"
		response['model_url'] = model_url
	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("GetPreTrainedModel %s", str(e), extra={'AppName': 'API'})

	return Response(response)


@api_view(['GET'])
def GetModel(request, token):
	response = {
		'status' : 200
	}
	try:
		model_path = 'files/trained_models/' + token + "/model.json"
		weight_path = 'files/trained_models/' + token + "/group1-shard1of1.bin"

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
		model_url = "http://" + HTTP_HOST + "/" + model_path
		response['model_url'] = model_url
	except Exception as e:
		response['status'] = 500
		exc_type, exc_obj, exc_tb = sys.exc_info()
		logger.error("GetModel %s", str(e), extra={'AppName': 'API'})
	return Response(response)


def GetImage(request):
	return FileResponse(open('files/images/aa.JPG', 'rb'))

def GetFile(request):
	return FileResponse(open('files/ABCDEG/model.json', 'rb'))

def GetModelFile(request):
	return FileResponse(open('files/ABCDEG/model.json', 'rb'))

def GetWeightFile(request):
	return FileResponse(open('files/ABCDEG/group1-shard1of1.bin', 'rb'))
