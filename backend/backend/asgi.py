"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

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
