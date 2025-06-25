# Django Rest Framework imports
from rest_framework import viewsets, generics, permissions
from rest_framework_simplejwt.views       import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Can I move the serializers.py file into this folder ?
from ..models      import                    Goal,           UserSettings,           Reminder,           ChatSession
from  .serializers import ProfileSerializer, GoalSerializer, UserSettingsSerializer, ReminderSerializer, ChatSessionSerializer, SignupSerializer
from  .mixins      import ProfileMixin

"""
ToDo:
* I should go back over everything and make sure the stuff that is sent/received makes sense
* Sentiment and topics need to be calculated somewhere
* Goal is supposed to be automatically updated when a ChatSession is finished

        sentiment = "N/A"
        topics = "N/A"
        message_text = get_message_text(messages)
        try:
            sentiment = sentiment_scores(message_text)
            topics = get_topics(message_text)
        except Exception as e:
            print(e)
            pass  # If there is an error in extracting sentiment or topics, we will return "N/A"
        
        # Update the goal
        goal = Goal.objects.get(user=profile)
        goal.reset()
        goal.current += 1
        goal.save()

        
def get_sentiment_topics(data_messages):
    message_text = get_message_text(data_messages)

    # Sentiment
    try:    sentiment = sentiment_scores(message_text)
    except: sentiment = "N/A"

    # Topics
    try:    topics = get_topics(message_text)
    except: topics = "N/A"

    return sentiment, topics

"""


# ======================================================================= ===================================
# Single-object endpoints (no list, one-to-one)
# ======================================================================= ===================================
# ToDo: add one-to-one contraints to these
class GoalView(ProfileMixin, generics.RetrieveUpdateAPIView):
    """
    (Might need to do the reset stuff or last start data that is implemented in the model definition...)
    GET  /api/goal/  => fetch the single Goal row for this user
    PUT  /api/goal/  => update "target", "startDay"
    """
    serializer_class   = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile = self.get_profile()
        goal, _ = Goal.objects.get_or_create(user=profile)
        return goal

class UserSettingsView(ProfileMixin, generics.RetrieveUpdateAPIView):
    """
    GET  /api/settings/  => fetch the single UserSettings row for this user
    PUT  /api/settings/  => update various fields
    """
    serializer_class   = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile = self.get_profile()
        settings, _ = UserSettings.objects.get_or_create(user=profile)
        return settings

# ======================================================================= ===================================
# List + Create
# ======================================================================= ===================================
class ReminderViewSet(ProfileMixin, viewsets.ModelViewSet):
    """
    ToDo: ....
    GET  /api/reminders/  => 
    PUT  /api/reminders/  => 
    """
    serializer_class   = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = self.get_profile()
        return Reminder.objects.filter(user=profile)
    
    def perform_create(self, serializer):
        serializer.save(user=self.get_profile())

# ======================================================================= ===================================
# Read-only List & Details (messages, biomarkers)
# ======================================================================= ===================================
class ChatSessionViewSet(ProfileMixin, viewsets.ReadOnlyModelViewSet):
    """
    ToDo:
        * I think I need to make sure average scores and duration are included
        * also add default string values to sentiment/topics
        * Add functionality to just get the latest chat session?
    """
    serializer_class   = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self): 
        profile = self.get_profile()
        return (ChatSession.objects
                .filter(user=profile)    # (only sessions for the logged-in user)
                .select_related("user")
                .prefetch_related("messages", "biomarker_scores"))

# ======================================================================= ===================================
# Profile Related Views
# ======================================================================= ===================================
class SignupView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class   = SignupSerializer

class ProfileView(ProfileMixin, generics.RetrieveAPIView):
    serializer_class   = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.get_profile()  

# ======================================================================= ===================================
# Tokens 
# ======================================================================= ===================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
