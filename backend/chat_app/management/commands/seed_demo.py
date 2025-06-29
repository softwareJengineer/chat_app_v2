from django.core.management.base import BaseCommand
from django.db           import transaction
from django.utils        import timezone
from django.contrib.auth import get_user_model

from datetime        import timedelta
from random          import random
from chat_app.models import Profile, UserSettings, Goal, ChatSession, ChatMessage, ChatBiomarkerScore

# Demo data
USERNAMES     = ("demo_patient", "demo_caregiver")
BIOMARKERS    = ("alteredgrammar", "anomia", "pragmatic", "pronunciation", "prosody", "turntaking")
DEMO_MESSAGES = [
    "Hi, I'm the user.", 
    "Hello, how are you today?", 
    "I'm doing well, thank you!", 
    "Can you tell me about your day?", 
    "Sure. This morning I went for a walk.",
]


class Command(BaseCommand):
    help = "Seeds demo users and a sample ChatSession with messages+biomarkers."

    # ====================================================================
    # Seed default demo data into the DB 
    # ====================================================================
    @transaction.atomic
    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Delete and recreate the user data
        User.objects.filter(username__in=USERNAMES).delete()

        # Create user entries for both the patient and caregiver
        plwd = User.objects.create_user("demo_patient",   password="1", first_name="John", last_name="Patient"  )
        care = User.objects.create_user("demo_caregiver", password="1", first_name="Jane", last_name="Caregiver")
        profile = Profile.objects.create(plwd=plwd, caregiver=care)

        # Also create settings and goal objects for the new Profile
        UserSettings.objects.create(user=profile)
        Goal        .objects.create(user=profile, target=5)

        # Add sample ChatSessions
        self.seed_chats(plwd, days_back=6)

    # ====================================================================
    # Seed ChatSessions into the DB for a user
    # ====================================================================
    def seed_chats(self, plwd_user, days_back=6):
        # Times for everything will override "auto_now_add" field properties
        now_utc = timezone.now()
        for i in range(days_back):
            day_offset = timedelta(days=i)
            started_at = (now_utc - day_offset).replace(hour=9, minute=0, second=0, microsecond=0)
            ended_at   = started_at + timedelta(minutes=5)

            # 1) Create a ChatSession object
            session = ChatSession.objects.create(user=plwd_user, source="webapp", is_active=False, date=started_at, end_ts=ended_at)

            # 2) Add ChatMessages to the ChatSession (message timestamps spaced 20 seconds apart)
            for idx, text in enumerate(DEMO_MESSAGES):
                ts   = started_at + timedelta(seconds=20 * idx)
                role = "user" if idx % 2 == 0 else "assistant"
                ChatMessage.objects.create(session=session, role=role, content=text, ts=ts)

            # 3) Add ChatBiomarkerScores to the ChatSession (random scores)
            for j in range(3):
                ts = started_at + timedelta(seconds=40 * j + 20)
                for score_type in BIOMARKERS:
                    ChatBiomarkerScore.objects.create(session=session, score_type = score_type, score=round(random(), 3), ts=ts)

            print(f"Seeded ChatSession for {(now_utc - day_offset).date()}")
