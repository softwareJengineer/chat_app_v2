import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Needs to be done before we can import QueryAuthMiddleware
import django
django.setup() 

from channels.routing             import ProtocolTypeRouter, URLRouter
from django.core.asgi             import get_asgi_application
from chat_app.websocket.routing   import websocket_urlpatterns
from chat_app.services.middleware import QueryAuthMiddleware

application = ProtocolTypeRouter({
    "http"     : get_asgi_application(),
    "websocket": QueryAuthMiddleware(URLRouter(websocket_urlpatterns)),
})
