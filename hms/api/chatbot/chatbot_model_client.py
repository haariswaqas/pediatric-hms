import requests
import json
from django.conf import settings  # ✅ import Django settings

# Use environment variable instead of hard-coded URL
FASTAPI_URL = getattr(settings, "MODEL_SERVICE_URL", "http://localhost:8005")


def _headers():
    """Return standard JSON headers"""
    return {'Content-Type': 'application/json'}


def post_chat(message: str, session_id: str | None = None, timeout: int = 120):
    """
    Call FastAPI /chat endpoint. Returns JSON response.
    """
    url = f"{FASTAPI_URL.rstrip('/')}/chat"
    payload = {'message': message}
    if session_id:
        payload['session_id'] = session_id

    print(f"DEBUG: Attempting to connect to FastAPI at: {url}")
    print(f"DEBUG: Payload: {payload}")
    print(f"DEBUG: Headers: {_headers()}")

    try:
        # First, test if the FastAPI server is reachable
        print(f"DEBUG: Testing connection to {FASTAPI_URL}")
        health_resp = requests.get(f"{FASTAPI_URL.rstrip('/')}/health", timeout=10)
        print(f"DEBUG: Health check status: {health_resp.status_code}")
        print(f"DEBUG: Health check response: {health_resp.text}")
    except Exception as health_e:
        print(f"DEBUG: Health check failed: {health_e}")
        print("DEBUG: FastAPI server may not be running or reachable")

    try:
        resp = requests.post(url, json=payload, headers=_headers(), timeout=timeout)
        print(f"DEBUG: POST response status: {resp.status_code}")
        print(f"DEBUG: POST response headers: {dict(resp.headers)}")
        print(f"DEBUG: POST response text: {resp.text}")
        
        if resp.status_code == 404:
            print("DEBUG: 404 - Check if endpoint exists and FastAPI is running correctly")
        elif resp.status_code == 502:
            print("DEBUG: 502 - Bad Gateway, likely FastAPI server issue")
        
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError as e:
        print(f"DEBUG: Connection error - FastAPI server likely not running: {e}")
        raise Exception(f"Cannot connect to FastAPI server at {FASTAPI_URL}. Is it running?")
    except requests.exceptions.Timeout as e:
        print(f"DEBUG: Timeout error: {e}")
        raise Exception(f"Request to FastAPI timed out after {timeout} seconds")
    except requests.exceptions.HTTPError as e:
        print(f"DEBUG: HTTP error: {e}")
        print(f"DEBUG: Response content: {e.response.text if e.response else 'No response'}")
        raise Exception(f"FastAPI returned HTTP error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"DEBUG: Request exception: {e}")
        raise Exception(f"Request to FastAPI failed: {e}")
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON decode error: {e}")
        print(f"DEBUG: Raw response: {resp.text}")
        raise Exception(f"Invalid JSON response from FastAPI: {e}")


def delete_session(session_id: str, timeout: int = 30):
    """
    Delete a conversation session in FastAPI
    """
    url = f"{FASTAPI_URL.rstrip('/')}/chat/{session_id}"
    resp = requests.delete(url, headers=_headers(), timeout=timeout)
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return resp.json()


def get_sessions(timeout: int = 30):
    """
    List active sessions from FastAPI
    """
    url = f"{FASTAPI_URL.rstrip('/')}/sessions"
    resp = requests.get(url, headers=_headers(), timeout=timeout)
    resp.raise_for_status()
    return resp.json()
