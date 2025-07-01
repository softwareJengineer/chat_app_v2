from urllib.parse                    import parse_qs
from django.contrib.auth.models      import AnonymousUser
#from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.middleware             import BaseMiddleware
from asgiref.sync                    import sync_to_async

ALLOWED_SOURCES = {"webapp", "mobile", "qtrobot", "buddyrobot"}

jwt_auth = JWTAuthentication() # re-use a single instance

# =======================================================================
# Authentication  
# =======================================================================
#@sync_to_async
#def _get_user(token_key):
#    """ Turns token=<key> into scope["user"] """
#    try:                       return Token.objects.select_related("user").get(key=token_key).user
#    except Token.DoesNotExist: return AnonymousUser()

@sync_to_async
def _get_user(token_str: str):
    """Validate JWT and return the associated user (or AnonymousUser)."""
    try:              return jwt_auth.get_user(jwt_auth.get_validated_token(token_str))
    except Exception: return AnonymousUser()
    

# =======================================================================
# Middleware: parse & validate
# =======================================================================
class QueryAuthMiddleware(BaseMiddleware):
    """
    Parse data from the WebSocket connection.
        * token/user -> authentication for the user making the request/having the conversation
        * source     -> identify the source of the request (i.e. the web app, robot, etc.)
    """
    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get("query_string", b"").decode())
        
        # Get values from the request
        token_key = query.get("token",  [None     ])[0]
        source    = query.get("source", ["unknown"])[0].lower()

        # Add to the scope
        scope["user"  ] = await _get_user(token_key)
        scope["source"] = source if source in ALLOWED_SOURCES else "unknown"

        return await super().__call__(scope, receive, send)

