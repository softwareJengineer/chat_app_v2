from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Session
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


# Create your views here.
def index(request):
    return render(request, 'index.html')

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=400)

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already exists'
            }, status=400)
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        return JsonResponse({
            'success': True,
            'username': user.username,
            'email': user.email
        })

