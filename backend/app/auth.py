from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
from app.config import settings

async def get_current_user_optional(request: Request) -> dict | None:
    """Extract user from Supabase JWT if present. Returns None if no token."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {"id": payload.get("sub"), "email": payload.get("email")}
    except JWTError:
        return None

async def get_current_user(user: dict | None = Depends(get_current_user_optional)) -> dict:
    """Require authenticated user."""
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
