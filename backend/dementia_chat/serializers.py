from rest_framework import serializers
from .models import Profile, UserSettings, Reminder, Chat

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "first_name", "last_name", "email", "password", "role"]

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['patientViewOverall', 'patientCanSchedule']
        
class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['title', 'start', 'end']
        
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['chatID', 'date', 'scores', 'avgScores', 'notes', 'messages', 'duration']
        read_only_fields = ['chatID', 'date']