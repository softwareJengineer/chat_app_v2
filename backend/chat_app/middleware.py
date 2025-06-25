from urllib.parse                    import parse_qs
from django.contrib.auth.models      import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.middleware             import BaseMiddleware
from asgiref.sync                    import sync_to_async

# =======================================================================
# Authentification Middleware 
# =======================================================================
# Turns token=<key> into scope["user"]

@sync_to_async
def _get_user(token_key):
    try:                       return Token.objects.select_related("user").get(key=token_key).user
    except Token.DoesNotExist: return AnonymousUser()

class QueryAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query         = parse_qs(scope.get("query_string", b"").decode())
        token_key     = query.get("token", [None])[0]
        scope["user"] = await _get_user(token_key)
        return await super().__call__(scope, receive, send)

