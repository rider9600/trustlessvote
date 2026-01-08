import os

class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", os.urandom(32))
    SESSION_TYPE = "filesystem"
    SESSION_PERMANENT = False

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Azure AD / MSAL
    AZURE_CLIENT_ID = os.environ.get("AZURE_CLIENT_ID", "")
    AZURE_CLIENT_SECRET = os.environ.get("AZURE_CLIENT_SECRET", "")
    AZURE_TENANT_ID = os.environ.get("AZURE_TENANT_ID", "common")
    AUTHORITY = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}"
    REDIRECT_PATH = os.environ.get("AUTH_REDIRECT_PATH", "/auth/redirect")
    BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")
    REDIRECT_URI = os.environ.get("AUTH_REDIRECT_URI", BASE_URL + REDIRECT_PATH)

    # Microsoft Graph scopes
    SCOPE = os.environ.get("AZURE_SCOPE", "User.Read Mail.Send offline_access openid profile email").split()

    # Storage
    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/data/uploads")
    DB_PATH = os.environ.get("DB_PATH", "/app/app.db")
