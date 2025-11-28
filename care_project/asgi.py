import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import care_app.routing  # Adjust to your app name

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'care_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            care_app.routing.websocket_urlpatterns
        )
    ),
})
