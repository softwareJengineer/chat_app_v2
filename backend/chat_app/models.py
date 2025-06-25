from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save
from django.dispatch import receiver

from django.utils import timezone
from datetime import timedelta


# Arguments that get reused
init_args = {"null": True, "blank": True}

# Should probably be somewhere else...
DAYS_OF_WEEK = (
    (0, 'Monday'),
    (1, 'Tuesday'),
    (2, 'Wednesday'),
    (3, 'Thursday'),
    (4, 'Friday'),
    (5, 'Saturday'),
    (6, 'Sunday'),
)

# ======================================================================= ===================================
# New chat framework
# ======================================================================= ===================================
"""
ChatSession fields potentially calculated on retrieval, i know that was a thing in postgres
    Overlapped speech
    average scores
These would be added as properties like duration is


"""
from django.conf      import settings
from django.db        import models
from django.db.models import UniqueConstraint, Q

# =======================================================================
# ChatSession 
# =======================================================================
# Every conversation is a ChatSession, but only one is ever active at once
class ChatSession(models.Model):
    SOURCE_CHOICES = [("webapp", "WebApp"), ("qtrobot", "QTRobot"), ("buddyrobot", "BuddyRobot")]

    # Initialized on chat creation
    user       = models.ForeignKey   (settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions")
    source     = models.CharField    (max_length=32, choices=SOURCE_CHOICES, default="webapp")
    started_at = models.DateTimeField(auto_now_add=True)

    # Updated on chat end
    is_active = models.BooleanField (default=True) 
    ended_at  = models.DateTimeField(**init_args)

    # Optional metadata to be filled when closing
    notes     = models.TextField(**init_args)
    topics    = models.CharField(**init_args, max_length=255)
    sentiment = models.CharField(**init_args, max_length=255)

    class Meta:
        ordering = ["-started_at", "id"]

        # One active session per user
        constraints = [
            UniqueConstraint(fields=["user"], condition=Q(is_active=True), name="unique_active_session_per_user",),
        ]

    # Returns session duration in seconds (None if active)
    @property
    def duration(self):
        end = self.ended_at or models.functions.Now()
        return (end - self.started_at).total_seconds()

# =======================================================================
# ChatMessage -- an array of these is assigned to each ChatSession
# =======================================================================
class ChatMessage(models.Model):
    # This may have to change later if word-level timestamps are added.
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]
    
    session   = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role      = models.CharField(max_length=32, choices=ROLE_CHOICES)
    content   = models.TextField()
    ts        = models.DateTimeField(auto_now_add=True)

    # ToDo: we don't realy have anything implemented yet that could get these here
    start_ts  = models.DateTimeField(**init_args)
    end_ts    = models.DateTimeField(**init_args)

    class Meta:
        ordering = ["-ts", "id"]

# =======================================================================
# ChatBiomarkerScore -- an array of these is assigned to each ChatSession
# =======================================================================
class ChatBiomarkerScore(models.Model):
    BIOMARKER_CHOICES = [("alteredgrammar", "AlteredGrammar"), ("anomia", "Anomia"), ("pragmatic", "Pragmatic"), 
                         ("pronunciation", "Pronunciation"), ("prosody", "Prosody"), ("turntaking", "Turntaking")]
    
    session    = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="biomarker_scores")
    score_type = models.CharField(max_length=32, choices=BIOMARKER_CHOICES)
    score      = models.FloatField()
    ts         = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-ts", "score_type", "id"]












# =======================================================================
# Create Models
# =======================================================================
class Profile(models.Model):
    plwd       = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name="PLwD")
    caregiver  = models.OneToOneField(User, on_delete=models.CASCADE, related_name="primary_caregiver")
    linkedUser = models.ForeignKey   (User, on_delete=models.SET_NULL, **init_args)
    
    def __str__(self): return f"{self.plwd.username} is linked to {self.caregiver.username}"

class Chat(models.Model):
    chatID    = models.BigAutoField         (auto_created=True, primary_key=True, serialize=False)
    user      = models.ForeignKey           (Profile, on_delete=models.CASCADE, related_name="chat_plwd")
    date      = models.DateTimeField        (auto_now_add=True, blank=True)
    duration  = models.PositiveIntegerField (**init_args)
    scores    = models.JSONField            (**init_args)
    avgScores = models.JSONField            (**init_args)
    notes     = models.TextField            (**init_args)
    messages  = models.JSONField            (**init_args)
    topics    = models.CharField            (**init_args, max_length=100) # (might need to be longer)
    sentiment = models.CharField            (**init_args, max_length=100)
    
    def __str__(self): return self.date

class Reminder(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reminder_user")
    title = models.CharField(max_length=100)
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    startTime = models.TimeField(null=True, blank=True)
    endTime = models.TimeField(null=True, blank=True)
    daysOfWeek = ArrayField(models.IntegerField(null=True, blank=True), size=7, null=True, blank=True)
    
    def __str__(self): return f"Reminder {self.title}"
        
class UserSettings(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE, primary_key=True, related_name="settings_user")
    patientViewOverall = models.BooleanField(default=True)
    patientCanSchedule = models.BooleanField(default=True)

    def __str__(self): return f"{self.user.plwd.username}'s settings"

class Goal(models.Model):
    user       = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="goal_user")
    target     = models.IntegerField(default=5)
    startDay   = models.IntegerField(default=0, choices=DAYS_OF_WEEK)
    current    = models.IntegerField(default=0)
    last_reset = models.DateField(**init_args)
    
    def get_last_start_date(self):
        """Returns the most recent date that matches the goal's start_day_of_week."""
        today  = timezone.localdate()
        offset = (today.weekday() - self.startDay) % 7
        last_start_date = today - timedelta(days=offset)
        return last_start_date
    
    def reset(self):
        today = timezone.localdate()
        last_start_date = self.get_last_start_date()

        if not self.last_reset or self.last_reset < last_start_date:
            self.current = 0
            self.last_reset = today
            self.save()
    
    def __str__(self):
        return f"{self.user.plwd.username} goal"
