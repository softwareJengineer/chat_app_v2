from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Session(models.Model):
    session_id = models.TextField(null=True, blank=True)  # Make field nullable
    user = models.ForeignKey(User, related_name="sessions", on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    scores = models.JSONField(null=True, blank=True)
    avg_scores = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    messages = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.date + " " + self.time