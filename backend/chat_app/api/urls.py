from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProfileView, SignupView, UserSettingsView, ChatsView, ChatView, ReminderView, MyTokenObtainPairView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('settings/', UserSettingsView.as_view(), name='settings'),
    path('chats/', ChatsView.as_view(), name='chats'),
    path('chat/chatid/<int:chatID>/', ChatView.as_view(), name='chat'),
    path('reminders/', ReminderView.as_view(), name='reminders'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
