from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import MyTokenObtainPairView

urlpatterns = [
    path('', views.index, name='index'),
    path('profile/', views.profile_view, name='profile'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),
    path('settings/', views.user_settings_view, name='settings'),
    path('chats/', views.chats_view, name='chats'),
    path('chat/chatid/<int:chatID>/', views.chat_view, name='chat'),
    path('chatcount/', views.chat_count_view, name='chat_count'),
    path('reminders//', views.reminder_view, name='reminders'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]