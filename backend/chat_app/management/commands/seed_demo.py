from django.core.management.base import BaseCommand
from django.db import transaction
from chat_app.models import Profile, UserSettings, Goal
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        User = get_user_model()
        with transaction.atomic():

            # Delete then recreate
            User.objects.filter(username__in=["demo_patient", "demo_caregiver"]).delete()

            # Create user entries for both the patient and caregiver
            plwd = User.objects.create_user("demo_patient",   password="demo", first_name="John", last_name="Patient",   is_staff=False)
            care = User.objects.create_user("demo_caregiver", password="demo", first_name="John", last_name="Caregiver", is_staff=True )
            profile = Profile.objects.create(plwd=plwd, caregiver=care)

            # Also create settings and goal objects for the new Profile
            UserSettings.objects.create(user=profile)
            Goal        .objects.create(user=profile)
      