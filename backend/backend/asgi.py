import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from django.core.asgi               import get_asgi_application
from channels.routing               import ProtocolTypeRouter, URLRouter
from channels.auth                  import AuthMiddlewareStack
from ..chat_app.services.middleware import QueryAuthMiddleware
from ..chat_app.websocket           import routing

application = ProtocolTypeRouter({
    "http"     : get_asgi_application(),
    "websocket": QueryAuthMiddleware(AuthMiddlewareStack(URLRouter(routing.websocket_urlpatterns))),
})
