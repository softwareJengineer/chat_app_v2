from django.db        import models
from django.db.models import UniqueConstraint, Q, Avg, Min
from django.conf      import settings
from django.utils     import timezone
from django.contrib.postgres.fields import ArrayField

from datetime  import timedelta

# Arguments that get reused
init_args    = dict(null=True, blank=True)
DAYS_OF_WEEK = ((0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),)


# =======================================================================
# ChatSession 
# =======================================================================
# Every conversation is a ChatSession, but only one is ever active at once
class ChatSession(models.Model):
    """
    * overlapped speech needs to be handled

    These properties would work totally fine as cached properties once the session 
    is not active, but I'm not sure I can guaruntee they won't be accessed until 
    then. Other solutions seem clunky right now...
    """
    SOURCE_CHOICES = [("webapp", "WebApp"), ("mobile", "Mobile"), ("qtrobot", "QTRobot"), ("buddyrobot", "BuddyRobot")]

    # Initialized on chat creation
    user       = models.ForeignKey   (settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions")
    source     = models.CharField    (max_length=32, choices=SOURCE_CHOICES, default="webapp")
    date       = models.DateTimeField(auto_now_add=True, blank=True)

    # Updated on chat end
    is_active = models.BooleanField (default=True)
    end_ts    = models.DateTimeField(**init_args)

    # Optional metadata to be filled when closing
    notes     = models.TextField(**init_args)
    topics    = models.CharField(**init_args, max_length=255, default="N/A")
    sentiment = models.CharField(**init_args, max_length=255, default="N/A")

    class Meta:
        constraints = [UniqueConstraint(fields=["user"], condition=Q(is_active=True), name="unique_active_session_per_user",),] # One active session per user
        ordering    = ["-date", "id"]

    @property
    def duration(self):
        end = self.end_ts or models.functions.Now()
        return (end - self.start_ts).total_seconds()
    
    @property
    def average_scores(self) -> dict[str, float]:
        """ Returns {'prosody': 0.71, 'pragmatic': 0.42, ...} (missing biomarkers are omitted) """
        qs = (self.biomarker_scores.values("score_type").annotate(avg=Avg("score")))
        return {row["score_type"]: row["avg"] for row in qs}

    @property
    def start_ts(self):
        """Returns the earliest timestamp from related biomarker scores or messages"""
        biomarker_ts = self.biomarker_scores.aggregate(min_ts=Min("ts"))["min_ts"]
        message_ts   = self.messages        .aggregate(min_ts=Min("ts"))["min_ts"]
        timestamps   = [ts for ts in [biomarker_ts, message_ts] if ts is not None]
        return min(timestamps) if timestamps else None

    def __str__(self): return self.date

# =======================================================================
# ChatMessage -- an array of these is assigned to each ChatSession
# =======================================================================
class ChatMessage(models.Model):
    """
    Once start/end timestamps are implemented, add a duration property.
    More may have to change later if word-level timestamps are added.
    """
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
        index_together = [("session", "ts")]
    
    def __str__(self): return f"{self.role}: {self.content}"

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

    def __str__(self): return f"{self.score_type:16}: {self.score:.4f}"

# =======================================================================
# Non-Chat Models
# =======================================================================
class Profile(models.Model):
    """
    ToDo:
        Seems like linkedUser should be a Profile not a User
        Also caregiver should maybe be ForeignKey, not OneToOne so that they can have multiple plwds
        (maybe caregiver is supposed to be the "main" one and linkedUser is others? ...)
    """
    plwd       = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name="PLwD")
    caregiver  = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="primary_caregiver")
    linkedUser = models.ForeignKey   (settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, **init_args)
    
    def __str__(self): return f"{self.plwd.username} is linked to {self.caregiver.username}"

class Reminder(models.Model):
    user       = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="reminder_user")
    title      = models.CharField(max_length=100)
    notes      = models.TextField    (**init_args)
    start      = models.DateTimeField(**init_args)
    end        = models.DateTimeField(**init_args)
    startTime  = models.TimeField    (**init_args)
    endTime    = models.TimeField    (**init_args)
    daysOfWeek = ArrayField(models.IntegerField(**init_args), size=7, **init_args)
    
    def __str__(self): return f"Reminder {self.title}"

# =======================================================================
# One-to-one Models
# =======================================================================
class Goal(models.Model):
    """
    ToDo: 
        Do we need these functions? Or can this be done in PUT? 
        If so, should probably remove them from here just to keep things clean.
    """
    user       = models.ForeignKey  (Profile, on_delete=models.CASCADE, related_name="goal_user")
    target     = models.IntegerField(default=5)
    startDay   = models.IntegerField(default=0, choices=DAYS_OF_WEEK)
    current    = models.IntegerField(default=0)
    last_reset = models.DateField   (**init_args)
    
    @property
    def remaining(self): return max(0, (self.target - self.current))

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
    
    def __str__(self): return f"{self.user.plwd.username} goal"
    
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user"], name="one_goal_per_user")]

class UserSettings(models.Model):
    user               = models.OneToOneField(Profile, on_delete=models.CASCADE, primary_key=True, related_name="settings_user")
    patientViewOverall = models.BooleanField(default=True)
    patientCanSchedule = models.BooleanField(default=True)

    def __str__(self): return f"{self.user.plwd.username}'s settings"

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user"], name="one_settings_per_user")]

