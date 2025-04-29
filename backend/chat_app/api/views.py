from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from ..models import Profile, Chat, Reminder, UserSettings
from ..serializers import ChatSerializer, ReminderSerializer, UserSettingsSerializer
from ..analysis import sentiment_scores, get_message_text, get_topics
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
            'firstName': user.first_name,
            "lastName": user.last_name,
        })

@csrf_exempt
def login_view(request, TokenObtainPairView):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)            
            plwd = None
            caregiver = None
            role = ""

            try:
                profile = Profile.objects.get(plwd=user)
                role = "Patient"
                plwd = user
                caregiver = profile.caregiver
            except Profile.DoesNotExist:
                try:
                    profile = Profile.objects.get(caregiver=user)
                    role = "Caregiver"
                    caregiver = user
                    plwd = profile.plwd
                except Profile.DoesNotExist:
                    try:
                        profile = Profile.objects.get(linkedUser=user) 
                        role = "Caregiver"
                        caregiver = profile.caregiver
                        plwd = profile.plwd
                    except Profile.DoesNotExist:
                        return JsonResponse({
                            "success": False,
                            "error": "Could not find the user."
                        })
            settings = UserSettings.objects.get(user=profile)
            
            return JsonResponse({
                'success': True,
                'plwdUsername': plwd.username,
                'plwdFirstName': plwd.first_name,
                "plwdLastName": plwd.last_name,
                'caregiverUsername': caregiver.username,
                'caregiverFirstName': caregiver.first_name,
                'caregiverLastName': caregiver.last_name,
                "role": role,
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
            plwd_username = data.get('plwdUsername')
            plwd_password = data.get('plwdPassword')
            plwd_first_name = data.get('plwdFirstName')
            plwd_last_name = data.get('plwdLastName')
            caregiver_username = data.get('caregiverUsername')
            caregiver_password = data.get('caregiverPassword')
            caregiver_first_name = data.get('caregiverFirstName')
            caregiver_last_name = data.get('caregiverLastName')
            
            
            if User.objects.filter(username=plwd_username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'PLwD username already exists.'
                }, status=400)
                
            if User.objects.filter(username=caregiver_username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Caregiver username already exists.'
                }, status=400)
                
            plwd_user = User.objects.create_user(
                username=plwd_username,
                password=plwd_password,
                first_name=plwd_first_name,
                last_name=plwd_last_name,
            )
            
            caregiver_user = User.objects.create_user(
                username=caregiver_username,
                password=caregiver_password,
                first_name=caregiver_first_name,
                last_name=caregiver_last_name
            )
            
            profile = Profile.objects.create(plwd=plwd_user, caregiver=caregiver_user)
            UserSettings.objects.create(user=profile)
            
            return JsonResponse({
                'success': True,
                'plwdUsername': plwd_user.username,
                'plwdFirstName': plwd_user.first_name,
                "plwdLastName": plwd_user.last_name,
                'caregiverUsername': caregiver_user.username,
                'caregiverFirstName': caregiver_user.first_name,
                'caregiverLastName': caregiver_user.last_name
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
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })
            
        settings = UserSettings.objects.get(user=profile)
        
        if settings is not None:
            settings.patientViewOverall=patientViewOverall
            settings.patientCanSchedule=patientCanSchedule
            settings.save()
        else:
            settings = UserSettings.objects.create(user=profile, patientViewOverall=patientViewOverall, patientCanSchedule=patientCanSchedule)
            
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
                'error': 'Could not find the user.'
            })
        
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })
            
        settings = UserSettings.objects.get(user=profile)
        
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
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })

        sentiment = "N/A"
        topics = "N/A"
        message_text = get_message_text(messages)
        try:
            sentiment = sentiment_scores(message_text)
            topics = get_topics(message_text)
        except:
            pass
        
        chat = Chat.objects.create(user=profile, date=date, scores=scores, avgScores=avgScores, notes=notes, messages=messages, 
                                   duration=duration, sentiment=sentiment, topics=topics)

        return JsonResponse({
            'success': True,
            'date': chat.date,
            'scores': chat.scores,
            'avgScores': chat.avgScores,
            'notes': chat.notes,
            'messages': chat.messages,
            'duration': chat.duration,
            'sentiment': chat.sentiment,
            'topics': chat.topics,
            'id': chat.chatID
        })
    elif request.method == 'GET':
        user = User.objects.get(username=username)
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })
    

        chats = Chat.objects.filter(user=profile).order_by('-date')
        
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
        
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
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
            'sentiment': chat.sentiment,
            'topics': chat.topics
        })
        
@csrf_exempt
def chat_count_view(request, username):
    if request.method == 'GET':
        user = User.objects.get(username=username)
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })
    

        chats = Chat.objects.filter(user=profile)
        chat_count = chats.count()
        
        return JsonResponse({
            'success': True,
            'chat_count': chat_count
        })
        
        
         
@csrf_exempt
# @login_required
def reminder_view(request, username):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        rrule = data.get('rrule')
        duration = data.get('duration')
        user = User.objects.get(username=username)
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })
        
        reminder = Reminder.objects.create(user=profile, title=title, start=start, end=end, rrule=rrule, duration=duration)
        
        return JsonResponse({
            'success': True,
            'title': reminder.title,
            'start': reminder.start,
            'end': reminder.end,
            'rrule': reminder.rrule,
            'duration': reminder.duration,
        })
    elif request.method == 'GET':
        user = User.objects.get(username=username)
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the user.'
                })

        reminders = Reminder.objects.filter(user=profile)

        
        response = [json.dumps(ReminderSerializer(reminder).data) for reminder in reminders]
        
        return JsonResponse({
            'success': True,
            'reminders': response
        })

