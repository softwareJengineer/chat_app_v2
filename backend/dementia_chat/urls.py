from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/login/', views.login_view, name='login'),
    path('api/signup/', views.signup_view, name='signup'),
    path('api/settings/', views.user_settings_view, name='settings'),
    path('api/chat/', views.chat_view, name='chat'),
    path('api/reminders', views.reminder_view, name='reminders'),
    path('api/profile/', views.profile_view, name='profile')
]