from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="User")
    role = models.CharField(max_length=100, null=True, blank=True)
    linked = models.OneToOneField(User, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="linkedUser")
    
    def __str__(self):
        return self.user.username + " is linked to " + self.linked.username

class Chat(models.Model):
    chat_id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='Chat ID', null=True),
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="chat_user")
    date = models.DateField(auto_now_add=True, blank=True, null=True)
    time = models.TimeField(auto_now_add=True, blank=True, null=True)
    scores = models.JSONField(null=True, blank=True)
    avg_scores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.date + " " + self.time
    
class Reminder(models.Model):
    user = models.ForeignKey(User, related_name="reminder_user", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    def __str__(self):
        return self.title + " starting at " + self.start + "and ending at " + self.end
    
class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="settings_user")
    patient_view_overall = models.BooleanField(default=True)
    patient_can_schedule = models.BooleanField(default=True)
