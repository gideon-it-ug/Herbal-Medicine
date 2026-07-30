"""
WSGI config for herbal_medicine project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# Add the repo root to sys.path so top-level apps (accounts, repository, etc.)
# are importable when gunicorn runs from the herbal_medicine/ subdirectory.
repo_root = str(Path(__file__).resolve().parent.parent.parent)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'herbal_medicine.settings')

application = get_wsgi_application()
