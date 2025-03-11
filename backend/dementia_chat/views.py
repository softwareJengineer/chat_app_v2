from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from .models import Profile
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
            profile = user.profile
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                "lastName": user.last_name,
                "role": profile.role,
                "settings": profile.settings
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
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        role = data.get('role')
        settings = data.get('settings')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already exists'
            }, status=400)
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        
        profile = Profile.objects.create(user=user, role=role, settings=settings)
        
        return JsonResponse({
            'success': True,
            'username': user.username,
            'email': user.email,
            'firstName': user.first_name,
            "lastName": user.last_name,
            "role": profile.role,
            "settings": profile.settings
        })

