# Django core imports
from django.shortcuts import get_object_or_404, render, redirect
from django.db import models, IntegrityError, transaction
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Django Rest Framework imports
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Local imports
from ..models import Profile, Chat, Reminder, UserSettings
from ..serializers import ChatSerializer, ReminderSerializer, UserSettingsSerializer
from ..analysis import sentiment_scores, get_message_text, get_topics

import json
import traceback


# Create your views here.
def index(request):
    return render(request, 'index.html')

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    
    plwd = None
    caregiver = None
    role = ""
    profile = None

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
            return JsonResponse({
                "success": False,
                "error": "Could not find the profile."
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
            profile = None

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
                            "error": "Could not find the profile."
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
@transaction.atomic
def signup_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Get data from the request
            plwd_username = data.get('plwdUsername')
            plwd_password = data.get('plwdPassword')
            plwd_first_name = data.get('plwdFirstName')
            plwd_last_name = data.get('plwdLastName')
            caregiver_username = data.get('caregiverUsername')
            caregiver_password = data.get('caregiverPassword')
            caregiver_first_name = data.get('caregiverFirstName')
            caregiver_last_name = data.get('caregiverLastName')

            # Check if PLwD username already exists
            if User.objects.filter(username=plwd_username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'PLwD username already exists.'
                }, status=400)

            # Check if Caregiver username already exists
            if User.objects.filter(username=caregiver_username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Caregiver username already exists.'
                }, status=400)
                        
            # Create users within a transaction
            with transaction.atomic():
                try:
                    # Create PLWD user
                    plwd_user = User.objects.create_user(
                        username=plwd_username,
                        password=plwd_password,
                        first_name=plwd_first_name,
                        last_name=plwd_last_name,
                    )

                    # Create Caregiver user
                    caregiver_user = User.objects.create_user(
                        username=caregiver_username,
                        password=caregiver_password,
                        first_name=caregiver_first_name,
                        last_name=caregiver_last_name,
                    )

                    # Create Profile and link plwd_user and caregiver_user
                    profile = Profile.objects.create(plwd=plwd_user, caregiver=caregiver_user)

                    # Now create UserSettings, passing the Profile object instead of User
                    UserSettings.objects.create(user=profile)

                except IntegrityError as e:
                    return JsonResponse({
                        'success': False,
                        'error': f"IntegrityError: {str(e)}"
                    }, status=400)
                except Exception as e:
                    return JsonResponse({
                        'success': False,
                        'error': f"Error: {str(e)}"
                    }, status=500)

            # Return success response with user data
            return JsonResponse({
                'success': True,
                'plwdUsername': plwd_user.username,
                'plwdFirstName': plwd_user.first_name,
                'plwdLastName': plwd_user.last_name,
                'caregiverUsername': caregiver_user.username,
                'caregiverFirstName': caregiver_user.first_name,
                'caregiverLastName': caregiver_user.last_name
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
# @login_required
def user_settings_view(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        patientViewOverall = data.get('patientViewOverall')
        patientCanSchedule = data.get('patientCanSchedule')
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
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
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
                })
            
        settings = UserSettings.objects.get(user=profile)
        
        if settings is None:
            return JsonResponse({
                'success': False,
                'error': 'Could not find the profile settings.'
            })
        else:
            return JsonResponse({
            'success': True,
            'patientViewOverall': settings.patientViewOverall,
            'patientCanSchedule': settings.patientCanSchedule
        })

@csrf_exempt
def chats_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        date = data.get('date')
        scores = data.get('scores')
        avgScores = data.get('avgScores')
        notes = data.get('notes')
        messages = data.get('messages')
        duration = data.get('duration')
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
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
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
                })
    

        chats = Chat.objects.filter(user=profile).order_by('-date')
        
        response = [json.dumps(ChatSerializer(chat).data) for chat in chats]
        
        return JsonResponse({
            'success': True,
            'chats': response
        })

        
@csrf_exempt
@login_required
def chat_view(request, chatID):
    if request.method == 'GET':
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
def chat_count_view(request):
    if request.method == 'GET':
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
                })
    

        chats = Chat.objects.filter(user=profile)
        chat_count = chats.count()
        
        return JsonResponse({
            'success': True,
            'chat_count': chat_count
        })
        
        
         
@csrf_exempt
# @login_required
def reminder_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        rrule = data.get('rrule')
        duration = data.get('duration')
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
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
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except:
                return JsonResponse({
                    'success': False,
                    'error': 'Could not find the profile.'
                })

        reminders = Reminder.objects.filter(user=profile)

        
        response = [json.dumps(ReminderSerializer(reminder).data) for reminder in reminders]
        
        return JsonResponse({
            'success': True,
            'reminders': response
        })

