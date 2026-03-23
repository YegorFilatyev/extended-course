import os
from datetime import datetime, timezone, timedelta

import bcrypt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import jwt, JWTError

from fastapi import Request, HTTPException, status

from dotenv import load_dotenv

import logging

logger = logging.getLogger(__name__)

load_dotenv()


class Security:

    security_scheme = HTTPBearer(auto_error=False)

    @staticmethod
    def hash_password(password: str):
        try:
            salt = bcrypt.gensalt(rounds=int(os.getenv('BCRYPT_ROUNDS')))
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hashing password: {e}")
            raise

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str):
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False

    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=30)
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), os.getenv("ALGORITHM"))
        return encode_jwt

    @staticmethod
    def verify_token(token: str):
        try:
            if token.startswith("Bearer "):
                token = token[7:]

            payload = jwt.decode(
                token,
                os.getenv("SECRET_KEY"),
                algorithms=[os.getenv("ALGORITHM")]
            )
            logger.debug(f"Token verified, payload: {payload}")
            return payload
        except JWTError as e:
            logger.error(f"JWT Error: {e}")
            return None

    @staticmethod
    async def get_current_user(
            request: Request,
            credentials: HTTPAuthorizationCredentials = None
    ) -> int:
        user_id = None
        token = None

        cookie_token = request.cookies.get("access_token")
        logger.info(f"Cookie token: {cookie_token}")

        if cookie_token:
            token = cookie_token
            if token.startswith("Bearer "):
                token = token[7:]
            payload = Security.verify_token(token)
            if payload:
                user_id = payload.get("sub")
                logger.info(f"User ID from cookie: {user_id}")

        if not user_id and credentials:
            token = credentials.credentials
            logger.info(f"Header token: {token}")
            if token.startswith("Bearer "):
                token = token[7:]
            payload = Security.verify_token(token)
            if payload:
                user_id = payload.get("sub")
                logger.info(f"User ID from header: {user_id}")

        if user_id:
            try:
                return int(user_id)
            except (ValueError, TypeError):
                pass

        logger.error("No valid authentication found")
        logger.error(f"Cookies received: {request.cookies}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"},)