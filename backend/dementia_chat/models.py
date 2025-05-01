from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Arguments that get reused
init_args = {"null": True, "blank": True}

# Create your models here.
class Profile(models.Model):
    plwd       = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="PLwD")
    caregiver  = models.OneToOneField(User, on_delete=models.CASCADE, related_name="primary_caregiver")
    linkedUser = models.ForeignKey   (User, on_delete=models.SET_NULL, **init_args)
    
    def __str__(self):
        return self.user.username + " is linked to " + self.linked.username

class Chat(models.Model):
    chatID    = models.BigAutoField         (auto_created=True, primary_key=True, serialize=False)
    user      = models.ForeignKey           (Profile, on_delete=models.CASCADE, related_name="chat_plwd")
    date      = models.DateTimeField        (auto_now_add=True, blank=True)
    duration  = models.PositiveIntegerField (**init_args)
    scores    = models.JSONField            (**init_args)
    avgScores = models.JSONField            (**init_args)
    notes     = models.TextField            (**init_args)
    messages  = models.JSONField            (**init_args)
    topics    = models.CharField            (**init_args, max_length=255) # (might need to be longer)
    sentiment = models.CharField            (**init_args, max_length=255)
    
    def __str__(self):
        return self.date
    
class Reminder(models.Model):
    user  = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reminder_user")
    title = models.CharField(max_length=100)
    start = models.DateTimeField()
    end   = models.DateTimeField()
    
    def __str__(self):
        return self.title + " starting at " + self.start + "and ending at " + self.end
    
class UserSettings(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE, primary_key=True, related_name="settings_user")
    patientViewOverall = models.BooleanField(default=True)
    patientCanSchedule = models.BooleanField(default=True)
