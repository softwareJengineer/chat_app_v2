from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, null=True, blank=True)
    settings = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.user.username

class Session(models.Model):
    session_id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='Session ID', null=True),
    user = models.ForeignKey(Profile, related_name="sessions", on_delete=models.CASCADE, blank=True, null=True)
    date = models.DateField(auto_now_add=True, blank=True, null=True)
    time = models.TimeField(auto_now_add=True, blank=True, null=True)
    scores = models.JSONField(null=True, blank=True)
    avg_scores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.date + " " + self.time
    
class Reminder(models.Model):
    user = models.ForeignKey(Profile, related_name="reminders", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    def __str__(self):
        return self.title + " starting at " + self.start + "and ending at " + self.end