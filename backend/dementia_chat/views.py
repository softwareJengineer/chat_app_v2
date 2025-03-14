from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from .models import Profile, Chat, Reminder, UserSettings
from django.contrib.auth import authenticate, login, logout
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
        
        profile = Profile.objects.create(user=user, role=role)
        UserSettings.objects.create(user=user)
        
        return JsonResponse({
            'success': True,
            'username': user.username,
            'email': user.email,
            'firstName': user.first_name,
            "lastName": user.last_name,
            "role": profile.role,
        })

@csrf_exempt
def user_settings_view(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        patient_view_overall = data.get('patientViewOverall')
        patient_can_schedule = data.get('patientCanSchedule')
        user = request.user
        
        if Profile.objects.filter(user=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        settings = UserSettings.objects.get(pk=user)
        settings.patient_view_overall = patient_view_overall
        settings.patient_can_schedule = patient_can_schedule
        settings.save()
        
        return JsonResponse({
            'success': True,
            'patientViewOverall': settings.patient_view_overall,
            'PatientCanSchedule': settings.patient_can_schedule
        })
        
    elif request.method == 'GET':
        user = request.user
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        settings = UserSettings.objects.get(pk=user)
        
        if settings is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user settings.'
            })
        else:
            return JsonResponse({
            'success': True,
            'patientViewOverall': settings.patient_view_overall,
            'PatientCanSchedule': settings.patient_can_schedule
        })
        
        
@csrf_exempt
def chat_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = request.user
        date = data.get('date')
        time = data.get('time')
        scores = data.get('scores')
        avg_scores = data.get('avgScores')
        notes = data.get('notes')
        messages = data.get('messages')
         
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
         
        chat = Chat.objects.create(user=user, date=date, time=time, scores=scores, avg_scores=avg_scores, notes=notes, messages=messages)
        
        return JsonResponse({
            'success': True,
            'date': chat.date,
            'time': chat.time,
            'scores': chat.scores,
            'avgScores': chat.avg_scores,
            'notes': chat.notes,
            'messages': chat.messages,
            'id': chat.chat_id
        })
    elif request.method == 'GET':
        user = request.user
        data = json.loads(request.body)
        chat_id = data.get('chatID')
        
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        chat = Chat.objects.get(pk=chat_id)
        
        if chat is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the chat.'
            })
        
        return JsonResponse({
            'success': True,
            'date': chat.date,
            'time': chat.time,
            'scores': chat.scores,
            'avgScores': chat.avg_scores,
            'notes': chat.notes,
            'messages': chat.messages,
        })
         
@csrf_exempt
def reminder_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = request.user
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        reminder = Reminder.objects.create(user=user, title=title, start=start, end=end)
        
        return JsonResponse({
            'success': True,
            'title': reminder.title,
            'start': reminder.start,
            'end': reminder.end
        })
    elif request.method == 'GET':
        user = request.user
        
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        reminders = Reminder.objects.filter(user=user)
        
        response = json.dumps(
            [{
                'title': reminder.title,
                'start': reminder.start,
                'end': reminder.end
            } for reminder in reminders]
        )
        
        return JsonResponse({
            'success': True,
            'reminders': response
        })

