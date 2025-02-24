from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Session


# Create your views here.
def index(request):
    return render(request, 'index.html')

