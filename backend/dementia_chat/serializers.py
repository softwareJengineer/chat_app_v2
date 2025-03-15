from rest_framework import serializers
from .models import Profile, UserSettings, Reminder, Chat

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "first_name", "last_name", "email", "password", "role"]

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['user', 'patient_view_overall', 'patient_can_schedule']
        
class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['user', 'title', 'start', 'end']
        
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['user', 'chat_id', 'date', 'time', 'scores', 'avg_scores', 'notes', 'messages']