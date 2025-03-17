from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/profile/', views.profile_view, name='profile'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/signup/', views.signup_view, name='signup'),
    path('api/settings/<str:username>/', views.user_settings_view, name='settings'),
    path('api/chats/<str:username>/', views.chats_view, name='chats'),
    path('api/chat/<str:username>/chatid/<int:chatID>/', views.chat_view, name='chat'),
    path('api/reminders/<str:username>/', views.reminder_view, name='reminders'),
]