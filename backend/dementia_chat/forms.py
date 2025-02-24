from django import forms
from django.forms import ModelForm
from .models import Session
from django.contrib.auth.models import User

class SessionForm(forms.ModelForm):
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
            # Filter teams to only show teams the user is part of
            self.fields['session'].queryset = Session.objects.filter(user=user)
            
class SessionUpdateForm(forms.ModelForm):
    notes = forms.CharField()

    class Meta:
        model = Session
        fields = ['user', 'date', 'time', 'scores', 'avg_scores', 'notes', 'messages']