from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Profile(models.Model):
    plwd = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="PLwD")
    caregiver = models.OneToOneField(User,on_delete=models.CASCADE, related_name="primary_caregiver")
    linkedUser = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    
    def __str__(self):
        return self.plwd.username + " is linked to " + self.caregiver.username

class Chat(models.Model):
    chatID = models.BigAutoField(auto_created=True, primary_key=True, serialize=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="chat_plwd")
    date = models.DateTimeField(auto_now_add=True, blank=True)
    scores = models.JSONField(null=True, blank=True)
    avgScores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)
    topics = models.CharField(null=True, blank=True, max_length=100)
    sentiment = models.CharField(null=True, blank=True, max_length=100)
    
    def __str__(self):
        return self.date
    
class Reminder(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reminder_user")
    title = models.CharField(max_length=100)
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    startTime = models.TimeField(null=True, blank=True)
    endTime = models.TimeField(null=True, blank=True)
    daysOfWeek = ArrayField(models.IntegerField(null=True, blank=True), size=7, null=True, blank=True)
    
    def __str__(self):
        return "Reminder " + self.title
    
class UserSettings(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE, primary_key=True, related_name="settings_user")
    patientViewOverall = models.BooleanField(default=True)
    patientCanSchedule = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.username + "'s settings"
