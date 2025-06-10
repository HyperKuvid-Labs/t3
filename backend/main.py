from fastapi import FastAPI, Request, Response, HTTPException, status, Depends
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import google.generativeai as genai
import string
from tqdm import tqdm
import subprocess
from prisma import Prisma
from prisma.models import User, ModelThing, Conversation, QueryResp
import asyncio
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
import json
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
import bcrypt
import logging

oauth = OAuth()

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    api_base_url='https://www.googleapis.com/',
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

app = FastAPI()

prisma = Prisma()

security = HTTPBearer(auto_error=False) #as we check for the oauth too, if given default after jwt verification it wont fallback to oauth, will raise the error directly

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await prisma.connect()
    print("Successfully connected to Prisma database.")

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
    print("Prisma gracefully disconnected. Thank You!")

#models
# models/embedding-gecko-001
# models/gemini-1.0-pro-vision-latest
# models/gemini-pro-vision
# models/gemini-1.5-pro-latest
# models/gemini-1.5-pro-001
# models/gemini-1.5-pro-002
# models/gemini-1.5-pro
# models/gemini-1.5-flash-latest
# models/gemini-1.5-flash-001
# models/gemini-1.5-flash-001-tuning
# models/gemini-1.5-flash
# models/gemini-1.5-flash-002
# models/gemini-1.5-flash-8b
# models/gemini-1.5-flash-8b-001
# models/gemini-1.5-flash-8b-latest
# models/gemini-1.5-flash-8b-exp-0827
# models/gemini-1.5-flash-8b-exp-0924
# models/gemini-2.5-pro-exp-03-25
# models/gemini-2.5-pro-preview-03-25
# models/gemini-2.5-flash-preview-04-17
# models/gemini-2.5-flash-preview-05-20
# models/gemini-2.5-flash-preview-04-17-thinking
# models/gemini-2.5-pro-preview-05-06
# models/gemini-2.0-flash-exp
# models/gemini-2.0-flash
# models/gemini-2.0-flash-001
# models/gemini-2.0-flash-exp-image-generation
# models/gemini-2.0-flash-lite-001
# models/gemini-2.0-flash-lite
# models/gemini-2.0-flash-preview-image-generation
# models/gemini-2.0-flash-lite-preview-02-05
# models/gemini-2.0-flash-lite-preview
# models/gemini-2.0-pro-exp
# models/gemini-2.0-pro-exp-02-05

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# class Model(BaseModel):

class UserModel(BaseModel):
    username : str
    password : str
    email : str

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGO")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("TTL_TOKEN")

class Token(BaseModel):
    access_token : str
    token_type : str

class UserLoginModel(BaseModel):
    username : str
    password : str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login-jwt")

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

def gemini_flash_resp(query: str, emotion: str = "") -> str:
    prompt = (
        f"This is the query from the user: {query}\n\n"
        "Answer it briefly and in a way any layman can understand if complex topics arise.\n"
        "Otherwise, keep the tone jovial, like a conversation between two friends."
    )

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    response = model.generate_content(prompt)

    return response.text

def gemini_pro_resp(query : str, emotion : str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents = prompt
    )

    return resp.text

# should fill for claude and then for at least one more model, maybe looking into deepseek

# ollama models equivalent to:
# 1. gemini 2.5 flash - gemma3
# 2. gemini 2.5 pro - llama3.3:70b or qwen 2.5
# 3. deepseekv3 - deepseek r1
# 4. claude 3.5 - gemma  or phi4:14b

# this is according to my research, update this if you can find something better.

# and more importantly dont delete this

#ollama models chosen - gemma3:27b, llama3.3:70b, deepseek-r1:70b, phi4:14b, need this for schema

#for ollama functions perplexity recommended to use asyncio subprocess, as something s break it seems, lets first run the thing and then chnage if needed, as it dint break in phydra
def ollama_gemma3_resp(query : str, emotion : str):
    prompt = f"""
        This is the query from the user: {query}

        Answer it more breifly and in a way any layman can understand if any complex topics arise.

        Otherwise maintain the tempo jovially, and make it sound like a conversation between two friends.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    result = subprocess.run(
        ["ollama", "run", "gemma3:27b", prompt],
        capture_output=True,
        text=True, 
        timeout=600,
    )

    # here we can consider 12b qwen model if we are running locally

    if result.returncode == 0:
        return result.stdout
    else:
        return f"There was some issue genrating the content with ollama gemma3: {result.stderr}"
    
def ollama_llama3_resp(query : str, emotion : str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    result = subprocess.run(
        ["ollama", "run", "llama3.3:70b", prompt],
        capture_output=True,
        text=True, 
        timeout=600,
    )

    #can chnage the model to qwen3:32b, when deploying maybe 235b params
    if result.returncode == 0:
        return result.stdout
    else:
        return f"There was some issue genrating the content with ollama llama3: {result.stderr}"
    
def ollama_deepseek_resp(query : str, emotion : str):
    prompt = f"""
        This is the query from the user: {query}

        You are DeepSeek — sharp, calm, and precise, with a hint of Chinese-accented clarity.

        Explain with strong logic, clean structure, and a friendly but formal tone.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    result = subprocess.run(
        ["ollama", "run", "deepseek-r1:70b", prompt],
        capture_output=True,
        text=True, 
        timeout=600,
    )

    if result.returncode == 0:
        return result.stdout
    else:
        return f"There was some issue genrating the content with ollama deepseek: {result.stderr}"
    

def ollama_phi_resp(query : str, emotion : str):
    prompt = f"""
        This is the query from the user: {query}

        You are concise, warm, and highly efficient in communication.

        Explain things simply, step by step, as if teaching someone new but curious.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    result = subprocess.run(
        ["ollama", "run", "phi4:14b", prompt],
        capture_output=True,
        text=True,  
        timeout=600,
    )

    if result.returncode == 0:
        return result.stdout
    else:
        return f"There was some issue genrating the content with ollama phi: {result.stderr}"
    
def verify_pwd(pwd : str, hpwd : str):
    return bcrypt.checkpw(pwd.encode('utf-8'), hashed_password=hpwd.encode('utf-8'))

def hash_password(pwd : str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd.encode('utf-8'), salt=salt)
    return hashed.decode('utf-8')

async def authenticate_user(username: str, password: str):
    user = await prisma.user.find_first(
        where={"username": username}
    )
    if user and verify_pwd(password, user.passwordHash):  
        return user
    return None
    
async def create_access_token(data, expiryTime: Optional[timedelta] = None):
    to_encode = data.copy() #basically shallow copy, for my ref
    if expiryTime:
        expire = datetime.utcnow() + expiryTime
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)

    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

async def get_current_user_jwt(token):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid JWT credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email : str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        exp : str = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logging.warning(f"Invalid JWT token: {str(e)}")
        raise credentials_exception from e
    except Exception as e:
        logging.error(f"Unexpected error during JWT validation: {str(e)}")
        raise credentials_exception from e
    
    user = await prisma.user.find_first(where={"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_user_oauth(request : Request):
    user_info = request.session.get("user")
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated via OAuth"
        )
    
    email = user_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OAuth session - missing email"
        )

    user = await prisma.user.find_first(where={"email": email})
    if not user:
        # Auto-create OAuth users if they don't exist
        try:
            user = await prisma.user.create(
                data={
                    "email": email,
                    "username": user_info.get("name", email.split("@")[0]),
                    "authProvider": "google",
                    "authId": user_info.get("sub"),
                    "passwordHash": ""  # No password for OAuth users
                }
            )
        except Exception as e:
            logging.error(f"Failed to create OAuth user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
    return user

async def get_current_user_flexible(request : Request, credentials : HTTPAuthorizationCredentials = Depends(security)) -> User:
    if credentials and credentials.credentials:
        try:
            return await get_current_user_jwt(credentials.credentials)
        except HTTPException:
            if not request.session.get("user"):
                raise JWTError
            
    try:
        return await get_current_user_oauth(request)
    except HTTPException as oauth_error:
        if credentials and credentials.credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid JWT token and no valid OAuth session",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    return await get_current_user_jwt(credentials.credentials)
#should make these routes protected
@app.get("/")
async def welcome(current_user: User = Depends(get_current_user_flexible)):
    return {
        "message": f"Welcome to Gidvion, {current_user.username}!",
        "user_id": current_user.id,
        "auth_provider": current_user.authProvider
    }

async def get_model_by_name(model_type: str, model_name: str) -> int:
    if model_type == "online":
        model = await prisma.modelthing.find_first(
            where={
                "type": "online",
                "nameOnline": model_name
            }
        )
    else:
        model = await prisma.modelthing.find_first(
            where={
                "type": "ollama", 
                "name": model_name
            }
        )
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Will add the model soon...")
    
    return model.modelId

async def get_default_conversation(user_id: int) -> int:
    """Get or create default conversation for user"""
    conversation = await prisma.conversation.find_first(
        where={
            "users": {
                "some": {"id": user_id}
            },
            "roomName": "default"
        }
    )
    
    if not conversation:
        conversation = await prisma.conversation.create(
            data={
                "roomName": "default",
                "users": {
                    "connect": {"id": user_id}
                }
            }
        )
    
    return conversation.id

@app.get("/query/gemini_flash")
async def query_gemini_flash(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = gemini_flash_resp(query, emotion)
    
    # Get model ID for Gemini Flash
    model_id = await get_model_by_name("online", "gemini2_5_flash")
    conversation_id = await get_default_conversation(current_user.id)
    
    # Log query to database
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "gemini_flash",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/query/gemini_pro")
async def query_gemini_pro(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = gemini_pro_resp(query, emotion)
    
    model_id = await get_model_by_name("online", "gemini2_5_pro")
    conversation_id = await get_default_conversation(current_user.id)
    
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "gemini_pro",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/query/ollama_gemma3")
async def query_ollama_gemma3(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = ollama_gemma3_resp(query, emotion)
    
    model_id = await get_model_by_name("ollama", "gemma3_27b")
    conversation_id = await get_default_conversation(current_user.id)
    
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "ollama_gemma3",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/query/ollama_llama3")
async def query_ollama_llama3(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = ollama_llama3_resp(query, emotion)
    
    model_id = await get_model_by_name("ollama", "llama3_3_70b")
    conversation_id = await get_default_conversation(current_user.id)
    
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "ollama_llama3",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/query/ollama_deepseek")
async def query_ollama_deepseek(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = ollama_deepseek_resp(query, emotion)
    
    model_id = await get_model_by_name("ollama", "deepseek_r1_70b")
    conversation_id = await get_default_conversation(current_user.id)
    
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "ollama_deepseek",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/query/ollama_phi")
async def query_ollama_phi(
    query: str, 
    emotion: str,
    current_user: User = Depends(get_current_user)
):
    response = ollama_phi_resp(query, emotion)
    
    model_id = await get_model_by_name("ollama", "phi4_14b")
    conversation_id = await get_default_conversation(current_user.id)
    
    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id
        }
    )
    
    return {
        "query": query,
        "response": response,
        "model": "ollama_phi",
        "user": current_user.username,
        "query_id": query_resp.id
    }

@app.get("/login/google")
async def signup(request : Request):
    redirect_uri = "http://localhost:8000/auth/google"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google")
async def auth_google(request : Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    request.session["user"] = user_info
    return RedirectResponse(url="/")

@app.post("/login-jwt")
async def login_jwt(formData : UserLoginModel):
    user = await authenticate_user(formData.username, formData.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = await create_access_token(data={"sub" : user.email}, expiryTime=timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES)))
    return {"access_token" : access_token, "token_type" : "bearer"}

@app.post("/register")
async def register(user_data: UserModel):
    try:
        # Check if user already exists
        existing_user = await prisma.user.find_unique(
            where={"email": user_data.email}
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        hashed = hash_password(user_data.password)
        user = await prisma.user.create(
            data={
                "username": user_data.username,
                "email": user_data.email,
                "passwordHash": hashed,
                "authProvider": "jwt"
            }
        )
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "authProvider": user.authProvider
        }
        
    except Exception as e:
        if "already exists" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
