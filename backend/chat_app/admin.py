from django.contrib import admin
from .models import Profile, Chat, Reminder, UserSettings

# Register your models here.
admin.site.register(Profile)
admin.site.register(Chat)
admin.site.register(Reminder)
admin.site.register(UserSettings)
