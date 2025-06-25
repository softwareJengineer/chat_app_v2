import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from channels.routing      import ProtocolTypeRouter, URLRouter
from channels.auth         import AuthMiddlewareStack
from ..chat_app.middleware import QueryAuthMiddleware
from ..chat_app.websocket  import routing


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    #"websocket": AuthMiddlewareStack(URLRouter(routing.websocket_urlpatterns)),
    "websocket": QueryAuthMiddleware(            # token  -> user
                     AuthMiddlewareStack(        # cookie -> user
                         URLRouter(routing.websocket_urlpatterns)
                     )
                 ),
})
