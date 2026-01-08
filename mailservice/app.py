import os
import uuid
import json
from datetime import datetime
from dateutil import parser as dateparser

from flask import Flask, redirect, session, url_for, request, jsonify, send_from_directory, abort
from flask_session import Session
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import msal
import requests
from apscheduler.schedulers.background import BackgroundScheduler

from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Sessions and CORS
    Session(app)
    CORS(app, supports_credentials=True, origins=app.config["CORS_ORIGINS"])

    # DB setup (simple SQLite for file metadata)
    engine = create_engine(f"sqlite:///{app.config['DB_PATH']}")
    with engine.begin() as conn:
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                original_name TEXT NOT NULL,
                mime_type TEXT,
                size INTEGER,
                path TEXT NOT NULL,
                uploader TEXT,
                created_at TEXT NOT NULL
            )
            """
        ))

    os.makedirs(app.config["UPLOAD_DIR"], exist_ok=True)

    # Scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()

    def build_msal_app(cache=None):
        return msal.ConfidentialClientApplication(
            client_id=app.config["AZURE_CLIENT_ID"],
            client_credential=app.config["AZURE_CLIENT_SECRET"],
            authority=app.config["AUTHORITY"],
            token_cache=cache,
        )

    def get_token():
        token = session.get("access_token")
        if token and datetime.utcnow() < datetime.fromisoformat(session.get("access_token_expires_at")):
            return token
        # try refresh
        refresh_token = session.get("refresh_token")
        if not refresh_token:
            return None
        app_msal = build_msal_app()
        result = app_msal.acquire_token_by_refresh_token(refresh_token, scopes=app.config["SCOPE"]) or {}
        if "access_token" in result:
            session["access_token"] = result["access_token"]
            expires_in = result.get("expires_in", 3600)
            session["access_token_expires_at"] = datetime.utcnow().replace(microsecond=0).isoformat()
            return result["access_token"]
        return None

    def require_auth():
        token = get_token()
        if not token:
            abort(401, description="Unauthorized. Please login via /login.")
        return token

    def graph_headers(token):
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    def send_graph_mail(token, to, subject, body_html):
        url = "https://graph.microsoft.com/v1.0/me/sendMail"
        payload = {
            "message": {
                "subject": subject,
                "body": {"contentType": "HTML", "content": body_html},
                "toRecipients": [{"emailAddress": {"address": to}}],
            },
            "saveToSentItems": True,
        }
        r = requests.post(url, headers=graph_headers(token), data=json.dumps(payload))
        if r.status_code not in (202, 200):
            raise RuntimeError(f"Graph sendMail failed: {r.status_code} {r.text}")

    def schedule_email(token, to, subject, body_html, run_dt):
        job_id = str(uuid.uuid4())
        # capture token snapshot; for long delays, consider refresh at runtime
        scheduler.add_job(
            func=lambda: send_graph_mail(token, to, subject, body_html),
            trigger="date",
            run_date=run_dt,
            id=job_id,
            replace_existing=False,
        )
        return job_id

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/login")
    def login():
        app_msal = build_msal_app()
        state = str(uuid.uuid4())
        session["state"] = state
        auth_url = app_msal.get_authorization_request_url(
            scopes=app.config["SCOPE"],
            redirect_uri=app.config["REDIRECT_URI"],
            state=state,
            prompt="select_account"
        )
        return redirect(auth_url)

    @app.get(Config.REDIRECT_PATH)
    def authorized():
        if request.args.get("state") != session.get("state"):
            return abort(400, description="Invalid state")
        code = request.args.get("code")
        if not code:
            return abort(400, description="Missing code")
        app_msal = build_msal_app()
        result = app_msal.acquire_token_by_authorization_code(
            code,
            scopes=app.config["SCOPE"],
            redirect_uri=app.config["REDIRECT_URI"],
        )
        if "error" in result:
            return abort(400, description=f"Auth error: {result.get('error_description')}")
        session["access_token"] = result["access_token"]
        session["refresh_token"] = result.get("refresh_token")
        session["id_token_claims"] = result.get("id_token_claims", {})
        expires_in = result.get("expires_in", 3600)
        session["access_token_expires_at"] = datetime.utcnow().replace(microsecond=0).isoformat()
        return redirect(url_for("me"))

    @app.get("/logout")
    def logout():
        session.clear()
        # Optional: also redirect to Microsoft logout endpoint
        return {"ok": True}

    @app.get("/me")
    def me():
        token = require_auth()
        r = requests.get("https://graph.microsoft.com/v1.0/me", headers=graph_headers(token))
        if r.status_code != 200:
            return abort(400, description=f"Graph error: {r.text}")
        return r.json()

    @app.post("/send-email")
    def send_email():
        token = require_auth()
        data = request.get_json(force=True)
        to = data.get("to")
        subject = data.get("subject", "(no subject)")
        body = data.get("body", "")
        send_at = data.get("send_at")  # ISO8601 optional
        if not to:
            return abort(400, description="Missing 'to'")
        if send_at:
            dt = dateparser.parse(send_at)
            job_id = schedule_email(token, to, subject, body, dt)
            return {"scheduled": True, "job_id": job_id, "run_at": dt.isoformat()}
        else:
            send_graph_mail(token, to, subject, body)
            return {"sent": True}

    # ---------------- Files API ----------------
    def current_user_upn():
        claims = session.get("id_token_claims") or {}
        return claims.get("preferred_username") or claims.get("upn") or claims.get("oid") or "anonymous"

    @app.post("/files")
    def upload_file():
        require_auth()
        if "file" not in request.files:
            return abort(400, description="No file part")
        f = request.files["file"]
        if f.filename == "":
            return abort(400, description="Empty filename")
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(f.filename)[1]
        stored_name = file_id + ext
        path = os.path.join(app.config["UPLOAD_DIR"], stored_name)
        f.save(path)
        size = os.path.getsize(path)
        with create_engine(f"sqlite:///{app.config['DB_PATH']}").begin() as conn:
            conn.execute(text(
                "INSERT INTO files (id, original_name, mime_type, size, path, uploader, created_at) VALUES (:id,:n,:m,:s,:p,:u,:c)"
            ), {
                "id": file_id,
                "n": f.filename,
                "m": f.mimetype,
                "s": size,
                "p": path,
                "u": current_user_upn(),
                "c": datetime.utcnow().isoformat(),
            })
        return {"id": file_id, "name": f.filename, "size": size}

    @app.get("/files")
    def list_files():
        require_auth()
        with create_engine(f"sqlite:///{app.config['DB_PATH']}").connect() as conn:
            rows = conn.execute(text("SELECT id, original_name, mime_type, size, uploader, created_at FROM files ORDER BY created_at DESC")).mappings().all()
            return {"files": [dict(r) for r in rows]}

    @app.get("/files/<file_id>")
    def download_file(file_id):
        require_auth()
        with create_engine(f"sqlite:///{app.config['DB_PATH']}").connect() as conn:
            row = conn.execute(text("SELECT original_name, path FROM files WHERE id=:id"), {"id": file_id}).mappings().first()
            if not row:
                return abort(404)
            directory = os.path.dirname(row["path"])
            filename = os.path.basename(row["path"])
            return send_from_directory(directory=directory, path=filename, as_attachment=True, download_name=row["original_name"])

    @app.delete("/files/<file_id>")
    def delete_file(file_id):
        require_auth()
        with create_engine(f"sqlite:///{app.config['DB_PATH']}").begin() as conn:
            row = conn.execute(text("SELECT path FROM files WHERE id=:id"), {"id": file_id}).mappings().first()
            if not row:
                return abort(404)
            try:
                os.remove(row["path"])
            except FileNotFoundError:
                pass
            conn.execute(text("DELETE FROM files WHERE id=:id"), {"id": file_id})
        return {"deleted": True}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
