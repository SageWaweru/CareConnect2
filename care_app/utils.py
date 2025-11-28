import json
from django.conf import settings

def get_vite_asset_path(asset):
    manifest_path = settings.BASE_DIR / "care_app/static/manifest.json"
    with open(manifest_path) as f:
        manifest = json.load(f)
    return f"/static/{manifest[asset]['file']}"
