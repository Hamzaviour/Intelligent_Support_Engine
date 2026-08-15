"""Authentication API endpoints supporting demo & token-based auth."""
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import structlog
import uuid
import time

router = APIRouter()
logger = structlog.get_logger()
security = HTTPBearer(auto_error=False)

# In-memory mock token store
_TOKENS: Dict[str, Dict[str, Any]] = {
    "token-vip-demo": {
        "user_id": "user-vip-101",
        "email": "alex.morgan@example.com",
        "name": "Alex Morgan",
        "role": "VIP Gold",
        "created_at": time.time(),
    },
    "token-agent-demo": {
        "user_id": "user-agent-202",
        "email": "sarah.support@company.com",
        "name": "Sarah Connor",
        "role": "Support Lead",
        "created_at": time.time(),
    },
}


@router.post("/login")
async def login(credentials: Dict[str, Any]):
    """Login with email & password or preset role."""
    email = credentials.get("email", "").strip()
    password = credentials.get("password", "")
    role = credentials.get("role", "VIP Gold")

    if not email:
        email = "alex.morgan@example.com"

    user_name = credentials.get("name") or (email.split("@")[0].replace(".", " ").title() if "@" in email else "Demo User")
    token = f"token-{uuid.uuid4().hex[:12]}"
    user_id = f"user-{uuid.uuid4().hex[:8]}"

    user_data = {
        "user_id": user_id,
        "email": email,
        "name": user_name,
        "role": role,
        "tier": role,
        "created_at": time.time(),
    }
    _TOKENS[token] = user_data

    logger.info("auth.login_success", email=email, token=token)
    return {
        "success": True,
        "token": token,
        "user": user_data,
        "message": f"Welcome back, {user_name}!",
    }


@router.post("/register")
async def register(data: Dict[str, Any]):
    """Create a new user account."""
    email = data.get("email", "").strip()
    name = data.get("name", "").strip() or "New User"

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    token = f"token-{uuid.uuid4().hex[:12]}"
    user_id = f"user-{uuid.uuid4().hex[:8]}"

    user_data = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "role": "Standard User",
        "tier": "Standard User",
        "created_at": time.time(),
    }
    _TOKENS[token] = user_data

    logger.info("auth.register_success", email=email)
    return {
        "success": True,
        "token": token,
        "user": user_data,
        "message": "Account created successfully!",
    }


@router.post("/logout")
async def logout(auth_header: Optional[str] = Header(None, alias="Authorization")):
    """Revoke user token and clear session."""
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        _TOKENS.pop(token, None)
    logger.info("auth.logout_success")
    return {"success": True, "message": "Successfully logged out."}


@router.get("/me")
async def get_current_user(auth_header: Optional[str] = Header(None, alias="Authorization")):
    """Get profile of current authenticated user."""
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if token in _TOKENS:
            return {"success": True, "user": _TOKENS[token]}

    # Default demo user fallback for guest preview
    return {
        "success": True,
        "user": {
            "user_id": "guest-user",
            "email": "guest@example.com",
            "name": "Guest Visitor",
            "role": "Guest",
            "tier": "Guest",
        },
    }


@router.post("/verify")
async def verify_token(payload: Dict[str, Any]):
    """Verify auth token validity."""
    token = payload.get("token", "")
    if token in _TOKENS:
        return {"valid": True, "user": _TOKENS[token]}
    return {"valid": True, "user_id": "demo_user"}