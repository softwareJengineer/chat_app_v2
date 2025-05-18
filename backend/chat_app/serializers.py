from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, UserSettings, Reminder, Chat, Goal

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name"]
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["plwd", "caregiver"]

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['patientViewOverall', 'patientCanSchedule']
        
class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['title', 'start', 'end', 'startTime', 'endTime', 'repeatDay']
        
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['chatID', 'date', 'scores', 'avgScores', 'notes', 'messages', 'duration', 'sentiment', 'topics']
        read_only_fields = ['chatID', 'date']
        
class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['target', 'startDay', 'current']