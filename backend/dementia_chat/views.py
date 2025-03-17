from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User, AnonymousUser
from .models import Profile, Chat, Reminder, UserSettings
from .serializers import ProfileSerializer, ChatSerializer, ReminderSerializer, UserSettingsSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


# Create your views here.
def index(request):
    return render(request, 'index.html')

@csrf_exempt
def profile_view(request, username):
    if request.method == 'GET':
        user = User.objects.get(username=username)
        profile = Profile.objects.get(pk=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        return JsonResponse({
            'success': True,
            'username': user.username,
            'email': user.email,
            'firstName': user.first_name,
            "lastName": user.last_name,
            "role": profile.role,
        })

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            profile = Profile.objects.get(pk=user)
            settings = UserSettings.objects.get(user=user)
            
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                "lastName": user.last_name,
                "role": profile.role,
                "settings": json.dumps(UserSettingsSerializer(settings).data),
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=400)

def logout_view(request):
    logout(request)
    
@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try: 
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
            
            if role == 'Caregiver':
                UserSettings.objects.create(user=user)
            
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                "lastName": user.last_name,
                "role": profile.role,
            })
        except json.JSONDecodeError:
            # Handle invalid JSON error
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
        
        except Exception as e:
            # Catch other potential errors and return a general error message
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
# @login_required
def user_settings_view(request, username):
    if request.method == 'PUT':
        data = json.loads(request.body)
        patientViewOverall = data.get('patientViewOverall')
        patientCanSchedule = data.get('patientCanSchedule')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        role = profile.role
        linked_user = profile.linked
        
        settings = None
        if role == 'Caregiver':
            settings = UserSettings.objects.get(user=user)
        else:
            settings = UserSettings.objects.get(linked_plwd=user)
        
        if settings is not None:
            settings.patientViewOverall=patientViewOverall
            settings.patientCanSchedule=patientCanSchedule
            settings.save()
        else:
            if role == 'Caregiver':
                settings = UserSettings.objects.create(user=user, patientViewOverall=patientViewOverall, patientCanSchedule=patientCanSchedule, linked_plwd=linked_user)
            else:
                settings = UserSettings.objects.create(linked_plwd=user, patientViewOverall=patientViewOverall, patientCanSchedule=patientCanSchedule, user=linked_user)
        
        return JsonResponse({
            'success': True,
            'patientViewOverall': settings.patientViewOverall,
            'patientCanSchedule': settings.patientCanSchedule
        })
        
    elif request.method == 'GET':
        user = User.objects.get(username=username)
        if user is None:
            return JsonResponse({
                'success': False,
                'error': 'User not authenticated.'
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
            'patientViewOverall': settings.patientViewOverall,
            'patientCanSchedule': settings.patientCanSchedule
        })

@csrf_exempt
def chats_view(request, username):
    if request.method == 'POST':
        data = json.loads(request.body)
        date = data.get('date')
        scores = data.get('scores')
        avgScores = data.get('avgScores')
        notes = data.get('notes')
        messages = data.get('messages')
        duration = data.get('duration')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(pk=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        role = profile.user
        linked_user = profile.linked
        
        chat = None
        if role == 'Caregiver':
            chat = Chat.objects.create(linked_caregiver=user, date=date, scores=scores, avgScores=avgScores, notes=notes, messages=messages, duration=duration, user=linked_user)
        else:
            chat = Chat.objects.create(user=user, date=date, scores=scores, avgScores=avgScores, notes=notes, messages=messages, duration=duration, linked_caregiver=linked_user)
        
        return JsonResponse({
            'success': True,
            'date': chat.date,
            'scores': chat.scores,
            'avgScores': chat.avgScores,
            'notes': chat.notes,
            'messages': chat.messages,
            'duration': chat.duration,
            'id': chat.chatID
        })
    elif request.method == 'GET':
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        role = profile.role
        chats = None
        
        if role == "Caregiver":
            chats = Chat.objects.filter(user=user)
        else:
            chats = Chat.objects.filter(linked_caregiver=user)
        
        response = [json.dumps(ChatSerializer(chat).data) for chat in chats]
        
        return JsonResponse({
            'success': True,
            'chats': response
        })

        
@csrf_exempt
# @login_required
def chat_view(request, username, chatID):
    if request.method == 'GET':
        user = User.objects.get(username=username)
        
        if Profile.objects.get(pk=user) is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
            
        chat = Chat.objects.get(pk=chatID)
        
        if chat is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the chat.'
            })
        
        return JsonResponse({
            'success': True,
            'date': chat.date,
            'scores': chat.scores,
            'avgScores': chat.avgScores,
            'notes': chat.notes,
            'messages': chat.messages,
            'duration': chat.duration,
        })
         
@csrf_exempt
# @login_required
def reminder_view(request, username):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(pk=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        role = profile.role
        linked_user = profile.linked
        
        reminder = None
        if role == 'Caregiver':
            reminder = Reminder.objects.create(caregiver=user, title=title, start=start, end=end, plwd=linked_user)
        else:
            reminder = Reminder.objects.create(plwd=user, title=title, start=start, end=end, caregiver=linked_user)
        
        return JsonResponse({
            'success': True,
            'title': reminder.title,
            'start': reminder.start,
            'end': reminder.end
        })
    elif request.method == 'GET':
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        
        if profile is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the user.'
            })
        
        role = profile.role
        reminders = None
        
        if role == "Caregiver":
            reminders = Reminder.objects.filter(caregiver=user)
        else:
            reminders = Reminder.objects.filter(plwd=user)
        
        response = [json.dumps(ReminderSerializer(reminder).data) for reminder in reminders]
        
        return JsonResponse({
            'success': True,
            'reminders': response
        })

