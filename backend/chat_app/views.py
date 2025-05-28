from django.shortcuts import get_object_or_404, render, redirect
from django.db import models
from django.contrib.auth.models import User
from .models import Profile, Chat, Reminder, UserSettings
from .serializers import ChatSerializer, ReminderSerializer, UserSettingsSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .utils.chat_helpers import get_user_profile, get_sentiment_topics, JsonError


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
def login_view(request):
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
    
# ====================================================================
# Sign Up
# ====================================================================
@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try: 
            data = json.loads(request.body)

            # New user info
            plwd_username        = data.get('plwdUsername')
            plwd_password        = data.get('plwdPassword')
            plwd_first_name      = data.get('plwdFirstName')
            plwd_last_name       = data.get('plwdLastName')
            
            # New caregiver info
            care_username   = data.get('caregiverUsername')
            care_password   = data.get('caregiverPassword')
            care_first_name = data.get('caregiverFirstName')
            care_last_name  = data.get('caregiverLastName')
            
            # Verify unique usernames
            if User.objects.filter(username=plwd_username).exists(): return JsonError("PLwD username already exists.",      status=400)
            if User.objects.filter(username=care_username).exists(): return JsonError("Caregiver username already exists.", status=400)
                
            # Create user and caregiver objects in the database
            plwd_user = User.objects.create_user(username=plwd_username, password=plwd_password, first_name=plwd_first_name, last_name=plwd_last_name)
            care_user = User.objects.create_user(username=care_username, password=care_password, first_name=care_first_name, last_name=care_last_name)
            
            # Create new Profiler & UserSettings objects for the new user
            profile = Profile.objects.create(plwd=plwd_user, caregiver=care_user)
            UserSettings.objects.create(user=profile)
            
            return JsonResponse({
                'success': True,
                'plwdUsername':      plwd_user.username,      'plwdFirstName': plwd_user.first_name,      "plwdLastName": plwd_user.last_name,
                'caregiverUsername': care_user.username, 'caregiverFirstName': care_user.first_name, 'caregiverLastName': care_user.last_name
            })
        
        # Handle invalid JSON error / Catch other potential errors and return a general error message
        except json.JSONDecodeError: return JsonError("Invalid JSON format", status=400)
        except Exception as e:       return JsonError(str(e),                status=500)

# ====================================================================
# User Settings
# ====================================================================
@csrf_exempt
# @login_required
def user_settings_view(request, username):
    if request.method == 'PUT':
        data = json.loads(request.body)
        patientViewOverall = data.get('patientViewOverall')
        patientCanSchedule = data.get('patientCanSchedule')

        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")
            
        # Update existing UserSettings or create new ones if they don't exist yet
        settings = UserSettings.objects.get(user=profile)
        if settings is not None:
            settings.patientViewOverall=patientViewOverall
            settings.patientCanSchedule=patientCanSchedule
            settings.save()
        else:
            settings = UserSettings.objects.create(user=profile, patientViewOverall=patientViewOverall, patientCanSchedule=patientCanSchedule)
            
        return JsonResponse({'success': True, 'patientViewOverall': settings.patientViewOverall, 'patientCanSchedule': settings.patientCanSchedule})
        
    elif request.method == 'GET':
        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")
            
        # Get the user's Settings
        settings = UserSettings.objects.get(user=profile)
        if settings is None: return JsonResponse({'success': False, 'error': 'Could not find the user settings.'})
        else:                return JsonResponse({'success': True, 'patientViewOverall': settings.patientViewOverall, 'patientCanSchedule': settings.patientCanSchedule})

# ====================================================================
# Chats (save a new Chat or load all of the user's previous Chats)
# ====================================================================
@csrf_exempt
def chats_view(request, username):
    # --------------------------------------------------------------------
    # Save a chat
    # --------------------------------------------------------------------
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")
       
        # Get the chat sentiment and topics
        sentiment, topics = get_sentiment_topics(data.get('messages'))
        
        # Create the Chat object     
        chat = Chat.objects.create(
            user        = profile, 
            date        = data.get('date'     ), 
            scores      = data.get('scores'   ), 
            avgScores   = data.get('avgScores'), 
            notes       = data.get('notes'    ), 
            messages    = data.get('messages' ), 
            duration    = data.get('duration' ), 
            sentiment   = sentiment, 
            topics      = topics
        )
        # Return the chat data
        return JsonResponse({
            'success': True, 'date': chat.date, 'scores': chat.scores, 'avgScores': chat.avgScores, 'notes': chat.notes, 'messages': chat.messages,
            'duration': chat.duration, 'sentiment': chat.sentiment, 'topics': chat.topics, 'id': chat.chatID
        })
    
    # --------------------------------------------------------------------
    # Return chat history for the user
    # -------------------------------------------------------------------- 
    elif request.method == 'GET':
        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")

        # Load all chats for the user & return them
        chats    = Chat.objects.filter(user=profile).order_by('-date')
        response = [json.dumps(ChatSerializer(chat).data) for chat in chats]
        
        return JsonResponse({'success': True, 'chats': response})

# ====================================================================
# Get a single Chat for a user (by ID)
# ====================================================================
@csrf_exempt
# @login_required
def chat_view(request, username, chatID):
    if request.method == 'GET':

        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")
        
        # Get chat
        chat = Chat.objects.get(pk=chatID)
        if chat is None: return JsonError("Could not find the chat.")
        
        return JsonResponse({
            'success': True, 'date': chat.date, 'scores': chat.scores, 'avgScores': chat.avgScores, 'notes': chat.notes, 
            'messages': chat.messages, 'duration': chat.duration, 'sentiment': chat.sentiment, 'topics': chat.topics
        })


@csrf_exempt
# @login_required
def reminder_view(request, username):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")
        
        # Create a new Reminder & return the details
        reminder = Reminder.objects.create(user=profile, title=data.get('title'), start=data.get('start'), end=data.get('end'))
        return JsonResponse({'success': True, 'title': reminder.title, 'start': reminder.start, 'end': reminder.end})
    
    elif request.method == 'GET':
        # Get the user's Profile
        profile = get_user_profile(username)
        if profile is None: return JsonError("Could not find the user.")

        reminders = Reminder.objects.filter(user=profile)
        response = [json.dumps(ReminderSerializer(reminder).data) for reminder in reminders]
        
        return JsonResponse({'success': True, 'reminders': response})

