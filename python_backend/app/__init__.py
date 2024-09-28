from flask import Flask
from dotenv import load_dotenv
import os
import logging
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from .routes import sms_routes, appointment_routes
from flask_session import Session
from datetime import timedelta

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(dotenv_path)
def create_app():
    
    app = Flask(__name__)
    app.secret_key = os.getenv('FLASK_SECRET_KEY')
    app.config['SESSION_TYPE'] = 'filesystem'
    session_dir = '/tmp/flask_session'
    os.makedirs(session_dir, exist_ok=True)
    app.config['SESSION_FILE_DIR'] = session_dir
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=5)
    
    Session(app)
    if not app.secret_key:
        raise ValueError("No FLASK_SECRET_KEY set for Flask application")
    
    csrf = CSRFProtect(app)
    CORS(app)
    
    logging.basicConfig(level=logging.INFO)
    app.register_blueprint(sms_routes.create_blueprint(csrf))
    app.register_blueprint(appointment_routes.bp)

    @app.route('/')
    def home():
        return {"message": "Welcome to Calm Connect"}

    return app

