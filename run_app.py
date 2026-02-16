
import subprocess
import time
import os
import sys

def run_app():
    # Ensure dependencies are installed for backend
    # (Joblib, flask, flask-cors, pandas, scikit-learn - we used them earlier)
    
    # Start Backend
    print("Starting Backend...")
    backend_process = subprocess.Popen(
        ["python3", "app.py"],
        cwd="/Users/zoolsrini/.gemini/antigravity/scratch/health-predict-app/backend"
    )
    
    # Start Frontend
    print("Starting Frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="/Users/zoolsrini/.gemini/antigravity/scratch/health-predict-app/frontend"
    )
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    run_app()
