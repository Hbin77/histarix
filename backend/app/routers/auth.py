from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import asyncio

from app.auth import create_access_token, create_verification_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.email import send_verification_email
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="비밀번호는 8자 이상이어야 합니다")

    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="이미 등록된 이메일입니다")

    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    verification_token = create_verification_token(user.email)
    email_sent = await asyncio.to_thread(send_verification_email, user.email, verification_token)

    token = create_access_token(user.id, user.email)
    return AuthResponse(
        token=token,
        user={"id": user.id, "name": user.name, "email": user.email},
    )


@router.get("/verify")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    import jwt as pyjwt
    from app.config import settings
    try:
        payload = pyjwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "email_verify":
            raise HTTPException(status_code=400, detail="잘못된 토큰입니다")
        email = payload["email"]
    except (pyjwt.PyJWTError, KeyError):
        raise HTTPException(status_code=400, detail="만료되었거나 잘못된 토큰입니다")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")

    user.email_verified = True
    await db.commit()
    return {"message": "이메일 인증이 완료되었습니다"}


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    token = create_access_token(user.id, user.email)
    return AuthResponse(
        token=token,
        user={"id": user.id, "name": user.name, "email": user.email},
    )


@router.get("/me")
async def get_me(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user["id"]))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "xp": db_user.xp,
        "level": db_user.level,
        "streak_days": db_user.streak_days,
    }
