from django import forms
from django.forms import ModelForm
from .models import Session
from .models import Reminder
from django.contrib.auth.models import User

class SessionForm(ModelForm):
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date-local'}))
    time = forms.TimeField(widget=forms.TimeInput(attrs={'type': 'time-local'}))
    scores = forms.JSONField()
    avg_scores = forms.JSONField()
    notes = forms.CharField()
    messages = forms.JSONField()

    class Meta:
        model = Session
        fields = ['user', 'date', 'time', 'scores', 'avg_scores', 'notes', 'messages']

    def __init__(self, *args, **kwargs):
        # Get the current user from the kwargs (passed in from the view)
        user = kwargs.pop('user', None)
        super(SessionForm, self).__init__(*args, **kwargs)
        
        if user:
            # Filter teams to only show sessions the user is part of
            self.fields['session'].queryset = Session.objects.filter(user=user)
            
class SessionUpdateForm(ModelForm):
    notes = forms.CharField()

    class Meta:
        model = Session
        fields = ['user', 'date', 'time', 'scores', 'avg_scores', 'notes', 'messages']
        
class ReminderForm(ModelForm):
    title = forms.CharField()
    start = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))
    end = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))

    class Meta:
        model = Reminder
        fields = ['user', 'title', 'start', 'end']
        
    def __init__(self, *args, **kwargs):
        # Get the current user from the kwargs (passed in from the view)
        user = kwargs.pop('user', None)
        super(ReminderForm, self).__init__(*args, **kwargs)
        
        if user:
            # Filter teams to only show reminders the user has made
            self.fields['reminder'].queryset = Reminder.objects.filter(user=user)