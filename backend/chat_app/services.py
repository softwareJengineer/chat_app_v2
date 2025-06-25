from django.db    import transaction
from django.utils import timezone
from .models      import ChatSession, ChatMessage, ChatBiomarkerScore

# =======================================================================
# Service for working with chat data
# =======================================================================
# --- ToDo: Need to add topic/sentiment fields, probably on close ---
# --- ToDo: If chat hasn't been modified in X time, save it and remake one automatically ---
# Later on may need to specifically add start/end timestamps to chats/messages
class ChatService:
    # -----------------------------------------------------------------------
    # Session Helpers
    # -----------------------------------------------------------------------
    @staticmethod
    @transaction.atomic
    def get_or_create_active_session(user, *, source="webapp"):
        """
        Returns the single active ChatSession for the user or creates one if needed.
        Wrapped in a transaction to avoid problems from things like two cuncurrent requests.
        """
        session, created = (ChatSession.objects.select_for_update().get_or_create(user=user, source=source, is_active=True))
        return session
    
    @staticmethod
    @transaction.atomic
    def close_session(user, *, notes=None, topics=None, sentiment=None):
        """
        Marks the current session inactive, fills in "ended_at", stores 
        optional metadata, and immediately opens a fresh/blank session.
        """
        session = ChatSession.objects.select_for_update().filter(user=user, is_active=True).first()
        if not session: return None

        session.is_active = False
        session.ended_at  = timezone.now()

        # ToDo: Probably should calculate the topics and sentiment right here using helper functions
        if notes     is not None: session.notes     = notes
        if topics    is not None: session.topics    = topics
        if sentiment is not None: session.sentiment = sentiment

        session.save()

        # Get ready for next conversation
        ChatSession.objects.create(user=user)
        return session
    
    # -----------------------------------------------------------------------
    # Message & Biomarker Score Helpers
    # -----------------------------------------------------------------------
    # Messages
    @staticmethod
    def add_message(user, role, text, *, start_ts=None, end_ts=None):
        session = ChatService.get_or_create_active_session(user)
        return ChatMessage.objects.create(session=session, role=role, content=text, start_ts=start_ts, end_ts=end_ts)
    
    # Biomarker Scores
    @staticmethod
    def add_biomarker(user, score_type, score):
        session = ChatService.get_or_create_active_session(user)
        return ChatBiomarkerScore.objects.create(session=session, score_type=score_type, score=score)

  
