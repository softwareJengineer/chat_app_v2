from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Session(models.Model):
    session_id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='Session ID', null=True),
    user = models.ForeignKey(User, related_name="sessions", on_delete=models.CASCADE, blank=True, null=True)
    date = models.DateField(auto_now_add=True, blank=True, null=True)
    time = models.TimeField(auto_now_add=True, blank=True, null=True)
    scores = models.JSONField(null=True, blank=True)
    avg_scores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.date + " " + self.time
    
class Reminder(models.Model):
    user = models.ForeignKey(User, related_name="reminders", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    def __str__(self):
        return self.title + " starting at " + self.start + "and ending at " + self.end