# Django core imports
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

# Django Rest Framework imports
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Local imports
from ..models import Profile, Chat, Reminder, UserSettings, Goal
from ..serializers import ChatSerializer, ReminderSerializer, UserSettingsSerializer, GoalSerializer
from ..analysis import sentiment_scores, get_message_text, get_topics

import json

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        """Handles GET request to fetch the user's profile information"""

        user = request.user

        plwd = None
        caregiver = None
        role = ""
        profile = None

        # Try to get the Profile for the patient (plwd)
        try:
            profile = Profile.objects.get(plwd=user)
            role = "Patient"
            plwd = user
            caregiver = profile.caregiver
        except Profile.DoesNotExist:
            # If the user is a caregiver, find the caregiver's profile
            try:
                profile = Profile.objects.get(caregiver=user)
                role = "Caregiver"
                caregiver = user
                plwd = profile.plwd
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)

        # Get the associated user settings
        settings = UserSettings.objects.get(user=profile)

        # Serialize the user settings
        settings_serializer = UserSettingsSerializer(settings)
        
        # Get the associated user goal
        goal = Goal.objects.get(user=profile)
        # Serialize the user goal
        goal_serializer = GoalSerializer(goal)

        # Return the profile information as a response
        return Response({
            'success': True,
            'plwdUsername': plwd.username,
            'plwdFirstName': plwd.first_name,
            'plwdLastName': plwd.last_name,
            'caregiverUsername': caregiver.username,
            'caregiverFirstName': caregiver.first_name,
            'caregiverLastName': caregiver.last_name,
            'role': role,
            'settings': settings_serializer.data,
            'goal': goal_serializer.data,
        })
    
class SignupView(APIView):
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data

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
                return Response({
                    'success': False,
                    'error': 'PLwD username already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if Caregiver username already exists
            if User.objects.filter(username=caregiver_username).exists():
                return Response({
                    'success': False,
                    'error': 'Caregiver username already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)
                        
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
                    
                    # Create Goal for the profile
                    Goal.objects.create(user=profile)

                except IntegrityError as e:
                    return Response({
                        'success': False,
                        'error': f"IntegrityError: {str(e)}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response({
                        'success': False,
                        'error': f"Error: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Return success response with user data
            return Response({
                'success': True,
                'plwdUsername': plwd_user.username,
                'plwdFirstName': plwd_user.first_name,
                'plwdLastName': plwd_user.last_name,
                'caregiverUsername': caregiver_user.username,
                'caregiverFirstName': caregiver_user.first_name,
                'caregiverLastName': caregiver_user.last_name
            }, status=status.HTTP_201_CREATED)
        except json.JSONDecodeError:
            return Response({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        data = request.data
        patientViewOverall = data.get('patientViewOverall')
        patientCanSchedule = data.get('patientCanSchedule')
        user = request.user
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)            
        settings = UserSettings.objects.get(user=profile)
        
         # Try to get or create the UserSettings instance
        settings, created = UserSettings.objects.get_or_create(user=profile)
        settings.patientViewOverall = patientViewOverall
        settings.patientCanSchedule = patientCanSchedule
        settings.save()

        # Return success response
        return Response({
            'success': True,
            'patientViewOverall': settings.patientViewOverall,
            'patientCanSchedule': settings.patientCanSchedule
        })
        
    def get(self, request):
        user = request.user
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)

        # Fetch user settings related to the profile
        try:
            settings = UserSettings.objects.get(user=profile)
            return Response({
                'success': True,
                'patientViewOverall': settings.patientViewOverall,
                'patientCanSchedule': settings.patientCanSchedule
            })
        except UserSettings.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Could not find the profile settings.'
            }, status=status.HTTP_404_NOT_FOUND)

class ChatsView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        """Handles POST request to create a new chat entry"""
        data = request.data  # DRF automatically parses JSON data
        date = data.get('date')
        scores = data.get('scores')
        avgScores = data.get('avgScores')
        notes = data.get('notes')
        messages = data.get('messages')
        duration = data.get('duration')
        user = request.user
        
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)

        sentiment = "N/A"
        topics = "N/A"
        message_text = get_message_text(messages)
        try:
            sentiment = sentiment_scores(message_text)
            topics = get_topics(message_text)
        except Exception as e:
            print(e)
            pass  # If there is an error in extracting sentiment or topics, we will return "N/A"
        
        # Update the goal
        goal = Goal.objects.get(user=profile)
        goal.reset()
        goal.current += 1
        goal.save()

        # Create the chat entry
        chat = Chat.objects.create(
            user=profile, date=date, scores=scores, avgScores=avgScores,
            notes=notes, messages=messages, duration=duration,
            sentiment=sentiment, topics=topics
        )

        # Return the created chat data
        serializer = ChatSerializer(chat)
        return Response({
            'success': True,
            'data': serializer.data
        } , status=status.HTTP_201_CREATED)

    def get(self, request):
        """Handles GET request to fetch user's chats"""
        user = request.user
        
        # Try to get the profile for either PLwD or Caregiver
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except Profile.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Could not find the profile.'
                }, status=status.HTTP_404_NOT_FOUND)

        # Fetch chats for the user
        chats = Chat.objects.filter(user=profile).order_by('-date')
        serializer = ChatSerializer(chats, many=True)

        # Return the list of chats
        return Response({
            'success': True,
            'chats': serializer.data
        })

class ChatView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        """Handles GET request to fetch a specific chat"""
        user = request.user
        
        profile = None
        try:
            profile = Profile.objects.get(plwd=user)
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)
            except Profile.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Could not find the profile.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            chat = Chat.objects.filter(user=profile).latest('date')
            # Serialize the chat object to JSON
            serializer = ChatSerializer(chat)
            
            # Return the serialized data
            return Response({
                'success': True,
                'chat': serializer.data
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
                'error': 'No chats found for this user.',
            }, status=status.HTTP_404_NOT_FOUND)
        
         
class ReminderView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        """Handles POST request to create a new reminder"""
        data = request.data  # DRF automatically parses JSON data
        title = data.get('title')
        start = data.get('start')
        end = data.get('end')
        startTime = data.get('startTime')
        endTime = data.get('endTime')
        daysOfWeek = data.get('daysOfWeek')
        user = request.user
        
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)
                
        # Create the reminder
        reminder = Reminder.objects.create(user=profile, title=title, start=start, end=end, startTime=startTime, endTime=endTime, daysOfWeek=daysOfWeek)
        
        # Serialize the reminder and return the response
        serializer = ReminderSerializer(reminder)
        return Response({
            'success': True,
            'reminder': serializer.data
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Handles GET request to fetch all reminders for the authenticated user"""
        user = request.user
        
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)
                
        # Fetch reminders for the user
        reminders = Reminder.objects.filter(user=profile)
        
        # Serialize the list of reminders
        serializer = ReminderSerializer(reminders, many=True)
        
        return Response({
            'success': True,
            'reminders': serializer.data
        })
        
    def delete(self, request):
        data = request.data
        id = data.get('id')
        user = request.user
        try:
            Reminder.objects.filter(id=id).delete()
            return Response({
                'success': True
            })
        except:
            return Response({
                'success': False,
                'error': 'Could not delete the reminder.'
            })
            
        
class GoalsView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def put(self, request):
        """Handles POST request to create a new reminder"""
        data = request.data  # DRF automatically parses JSON data
        startDay = data.get('startDay')
        target = data.get('target')
        user = request.user
        
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)
                
        # Update the goal
        goal, created = Goal.objects.get_or_create(user=profile)
        goal.target = target
        goal.startDay = startDay
        goal.save()
        
        # Serialize the goal and return the response
        serializer = GoalSerializer(goal)
        return Response({
            'success': True,
            'goal': serializer.data
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Handles GET request to fetch the goal for the authenticated user"""
        user = request.user
        
        profile = None
        # Try to get the profile for either PLwD or Caregiver
        try:
            profile = Profile.objects.get(plwd=user)  # Try to get the profile for the patient
        except Profile.DoesNotExist:
            try:
                profile = Profile.objects.get(caregiver=user)  # If not found, try to get the caregiver profile
            except Profile.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Could not find the profile."
                }, status=status.HTTP_404_NOT_FOUND)
                
        # Fetch goal for the user
        goal = Goal.objects.get(user=profile)
        
        # Serialize the goal
        serializer = GoalSerializer(goal)
        
        return Response({
            'success': True,
            'goal': serializer.data
        })