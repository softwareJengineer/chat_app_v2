from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="User")
    role = models.CharField(max_length=100, null=True, blank=True)
    linked = models.OneToOneField(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="linked_user")
    
    def __str__(self):
        return self.user.username + " is linked to " + self.linked.username

class Chat(models.Model):
    chatID = models.BigAutoField(auto_created=True, primary_key=True, serialize=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_plwd")
    date = models.DateTimeField(auto_now_add=True, blank=True)
    scores = models.JSONField(null=True, blank=True)
    avgScores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)
    linked_caregiver = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name="chat_caregiver")
    
    def __str__(self):
        return self.date
    
class Reminder(models.Model):
    caregiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reminder_caregiver")
    plwd = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="reminder_plwd")
    title = models.CharField(max_length=100)
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    def __str__(self):
        return self.title + " starting at " + self.start + "and ending at " + self.end
    
class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="settings_caregiver")
    patientViewOverall = models.BooleanField(default=True)
    patientCanSchedule = models.BooleanField(default=True)
    linked_plwd = models.OneToOneField(User, on_delete=models.SET_NULL, blank=True, null=True, related_name="settings_plwd")
