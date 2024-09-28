from app import create_app
import os
import shutil

def clear_session():
    session_dir = '/tmp/flask_session'
    if os.path.exists(session_dir):
        shutil.rmtree(session_dir)
    os.makedirs(session_dir, exist_ok=True)
  
    print("----------\n\nSession cleared\n\n----------")

def run_app():
    clear_session()
    app = create_app()
    port = int(os.getenv('FLASK_RUN_PORT', 5001))
    app.run(debug=True, port=port)

if __name__ == '__main__':
    run_app()