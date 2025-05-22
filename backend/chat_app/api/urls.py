from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProfileView, SignupView, UserSettingsView, ChatsView, ChatView, ReminderView, MyTokenObtainPairView, GoalsView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('settings/', UserSettingsView.as_view(), name='settings'),
    path('chats/', ChatsView.as_view(), name='chats'),
    path('chat/recent/', ChatView.as_view(), name='recent_chat'),
    path('reminders/', ReminderView.as_view(), name='reminders'),
    path('goal/', GoalsView.as_view(), name='goals'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
