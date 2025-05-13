from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.http import JsonResponse

from ..models   import Profile
from ..analysis import get_message_text, sentiment_scores, get_topics

# ====================================================================
# Get the user's Profile
# ====================================================================
@csrf_exempt
def get_user_profile(username):
    """
    Returns a Profile object for a given user (plwd or caregiver).
    Still need to wrap the result when called:
        profile = get_user_profile(username)
        if profile is None: return JsonResponse({"success": False, "error": "Could not find the user."})
    """
    user = User.objects.get(username=username)
    if user is None: return None

    # Try to get profile for the user
    try:   profile = Profile.objects.get(plwd=user)
    except Profile.DoesNotExist:
        # Try to get a profile for the caregiver
        try:    profile = Profile.objects.get(caregiver=user)
        except: profile = None
    return profile

# ====================================================================
# Get a chats sentiment & topics
# ====================================================================
@csrf_exempt
def get_sentiment_topics(data_messages):
    message_text = get_message_text(data_messages)

    # Sentiment
    try:    sentiment = sentiment_scores(message_text)
    except: sentiment = "N/A"

    # Topics
    try:    topics = get_topics(message_text)
    except: topics = "N/A"

    return sentiment, topics

# ====================================================================
# Just easier error handling
# ====================================================================
def JsonError(msg: str, status: int = None):
    response = {"success": False, "error": msg}
    if status: return JsonResponse(response, status=status)
    else:      return JsonResponse(response)

