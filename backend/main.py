from fastapi import FastAPI, Request, Response, HTTPException, status, Depends, UploadFile, File, BackgroundTasks
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
import uvicorn
import google.generativeai as genai
import string
from tqdm import tqdm
import subprocess
from prisma import Prisma
from prisma.models import User, Model, Conversation, QueryResp
import asyncio
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
import json
from pydantic import BaseModel
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional, List
import bcrypt
import logging
import uuid
import anthropic
import io
import PyPDF2
from googleapiclient.discovery import build
import shutil
import zipfile
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

oauth = OAuth()

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
GOOGLE_SEARCH_ENGINE_ID=os.getenv('GOOGLE_SEARCH_ENGINE_ID')

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    api_base_url='https://www.googleapis.com/',
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
    client_kwargs={
        'scope': 'openid email profile',
        'prompt' : 'select_account'
    }
)

app = FastAPI()

prisma = Prisma()

security = HTTPBearer(
    auto_error=True
)  # as we check for the oauth too, if given default after jwt verification it wont fallback to oauth, will raise the error directly

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://localhost:5173", 
        "http://127.0.0.1:5173"   
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

async def load_models_in_db():
    try:
        existing_models = await prisma.model.count()
        if existing_models > 0:
            print(f"Models already exist in database: {existing_models} records")
            return

        online_models = [
            {"type": "online", "nameOnline": "gemini2_5_flash"},
            {"type": "online", "nameOnline": "gemini2_5_pro"},
            {"type": "online", "nameOnline": "deepseekv3"},
            {"type": "online", "nameOnline": "claude3_5"},
        ]

        ollama_models = [
            {"type": "ollama", "name": "gemma3_27b"},
            {"type": "ollama", "name": "llama3_3_70b"},
            {"type": "ollama", "name": "deepseek_r1_70b"},
            {"type": "ollama", "name": "phi4_14b"},
        ]

        for model_data in online_models + ollama_models:
            await prisma.model.create(data=model_data)

        print(f"Successfully seeded {len(online_models + ollama_models)} models")

    except Exception as e:
        print(f"Error seeding models: {e}")
        raise


@app.on_event("startup")
async def startup():
    await prisma.connect()
    await load_models_in_db()
    print("Successfully connected to Prisma database.")


@app.on_event("shutdown")
async def shutdown():
    await prisma.connect()
    print("Prisma gracefully disconnected. Thank You!")


# google/ gemini models
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

# claude models

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key="AIzaSyAxlaAthy3YF2Ul15VdgCwPhSoOyGK2hWk")

# client = anthropic.Anthropic(CLAUDE_API_KEY)


class UserModel(BaseModel):
    username: str
    email: str
    password: str


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGO")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("TTL_TOKEN")


class Token(BaseModel):
    access_token: str
    token_type: str


class UserLoginModel(BaseModel):
    username: str
    password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login-jwt")
# security = HTTPBearer(auto_error=False)

app.add_middleware(SessionMiddleware, 
                   secret_key=SECRET_KEY,
                   session_cookie="session",
                   max_age=None,
                   same_site="lax",
                   https_only=True)

async def generate_ai_conversation_name(query: str, response: str) -> str:
    prompt = f"""
    Based on this conversation starter, generate a short, descriptive title (3-6 words max):
    
    User: {query[:200]}
    AI: {response[:200]}
    
    Title should be concise and capture the main topic. Examples:
    - "Python coding help"
    - "Recipe for pasta"
    - "Travel planning advice"
    
    Title:"""
    
    try:
        model = await genai.GenerativeModel("gemini-1.5-flash-latest")
        result = model.generate_content(prompt)
        title = result.text.strip().replace('"', '').replace("Title:", "").strip()
        return title[:50] 
    except:
        return await generate_conversation_name(query) 
    
def generate_conversation_name(first_message: str, max_length: int = 50) -> str:
    cleaned = " ".join(first_message.strip().split())

    if len(cleaned) <= max_length:
        return cleaned
    
    return cleaned[:max_length-3] + "..."

def gemini_flash_resp(query: str, emotion: str = "") -> str:
    
    prompt = (
        f"You are an AI assistant responding to the following user query:\n\n"
        f'User\'s Query: "{query}"\n\n'
        "Please keep your answers brief, clear, and simple enough for a layman to understand. "
        "If the topic is technical, use analogies or simple language. "
        "Maintain a friendly, informal tone — like a helpful friend in a casual conversation."
    )

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

    model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    response = model.generate_content(prompt)

    return response.text


def gemini_pro_resp(query: str, emotion: str, search_context : str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

    if search_context:
        print(f"Search context: {search_context}")
        prompt += f"""
        Also, this is the web search context for the query, consider this by giving the resp, if irrelevant, ignore:
        {search_context}
        """

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents=prompt
    )

    return resp.text


# def claude_resp(query : str, emotion : str):


# should fill for claude and then for at least one more model, maybe looking into deepseek

# ollama models equivalent to:
# 1. gemini 2.5 flash - gemma3
# 2. gemini 2.5 pro - llama3.3:70b or qwen 2.5
# 3. deepseekv3 - deepseek r1
# 4. claude 3.5 - gemma  or phi4:14b

# this is according to my research, update this if you can find something better.

# and more importantly dont delete this

# ollama models chosen - gemma3:27b, llama3.3:70b, deepseek-r1:70b, phi4:14b, need this for schema


def ollama_gemma3_resp(query: str, emotion: str):
    prompt = f"""
        This is the query from the user: {query}

        Answer it more breifly and in a way any layman can understand if any complex topics arise.

        Otherwise maintain the tempo jovially, and make it sound like a conversation between two friends.
    """

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

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


def ollama_llama3_resp(query: str, emotion: str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

    result = subprocess.run(
        ["ollama", "run", "llama3.3:70b", prompt],
        capture_output=True,
        text=True,
        timeout=600,
    )

    # can chnage the model to qwen3:32b, when deploying maybe 235b params
    if result.returncode == 0:
        return result.stdout
    else:
        return f"There was some issue genrating the content with ollama llama3: {result.stderr}"


def ollama_deepseek_resp(query: str, emotion: str):
    prompt = f"""
        This is the query from the user: {query}

        You are DeepSeek — sharp, calm, and precise, with a hint of Chinese-accented clarity.

        Explain with strong logic, clean structure, and a friendly but formal tone.
    """

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

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


def ollama_phi_resp(query: str, emotion: str):
    prompt = f"""
        This is the query from the user: {query}

        You are concise, warm, and highly efficient in communication.

        Explain things simply, step by step, as if teaching someone new but curious.
    """

    if emotion:
        prompt += (
            f"\n\nThe user is feeling **{emotion}** right now. "
            "Adapt your tone, word choice, and response style to align with this emotion. "
            "For example, if the user feels sad, be more gentle and supportive. "
            "If excited, match their enthusiasm. If confused, be calm and reassuring. "
            "Use emotional intelligence in your response."
        )

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


def verify_pwd(pwd: str, hpwd: str):
    return bcrypt.checkpw(pwd.encode("utf-8"), hashed_password=hpwd.encode("utf-8"))


def hash_password(pwd: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd.encode("utf-8"), salt=salt)
    return hashed.decode("utf-8")


async def authenticate_user(username: str, password: str):
    user = await prisma.user.find_first(where={"name": username})
    if user and verify_pwd(password, user.passwordHash):
        return user
    return None


async def create_access_token(data, expiryTime: Optional[timedelta] = None):
    to_encode = data.copy()  # basically shallow copy, for my ref
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
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        exp: str = payload.get("exp")
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


async def get_current_user_oauth(request: Request):
    user_info = request.session.get("user")
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated via OAuth",
        )

    email = user_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OAuth session - missing email",
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
                    "passwordHash": "",  # No password for OAuth users
                }
            )
        except Exception as e:
            logging.error(f"Failed to create OAuth user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account",
            )
    return user


async def get_current_user_flexible(
    request: Request, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    print(credentials.json())
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
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    return await get_current_user_jwt(credentials.credentials)

async def google_web_search(query: str, api_key: str, cse_id: str, num_results: int = 5):
    try:
        service = await build("customsearch", "v1", developerKey=api_key)
        result = await service.cse().list(
            q=query,
            cx=cse_id,
            num=num_results
        ).execute()
        
        search_results = []
        for item in result.get('items', []):
            search_results.append({
                'title': item.get('title'),
                'link': item.get('link'),
                'snippet': item.get('snippet')
            })
        return search_results
    except Exception as e:
        return f"Search error: {str(e)}"

class ConvoModel(BaseModel):
    query : str
    emotion : str = ""
    webSearch : bool = False
    Conversation_id : int

async def welcome(current_user: User = Depends(get_current_user_flexible)):
    return {
        "message": f"Welcome to Gidvion, {current_user.username}!",
        "user_id": current_user.id,
        "auth_provider": current_user.authProvider,
    }


async def get_model_by_name(model_type: str, model_name: str) -> int:
    try:
        if model_type == "online":
            model = await prisma.model.find_first(where={"nameOnline": model_name})
        else:
            model = await prisma.model.find_first(where={"name": model_name})
    except Exception as e:
        print(e)

    # print(model)

    if not model:
        print(model_name)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Will add the model soon..."
        )

    return model.modelId


async def get_default_conversation(user_id: int) -> int:
    conversation = await prisma.conversation.find_first(
        where={"users": {"some": {"id": user_id}}, "roomName": "default"}
    )

    if not conversation:
        conversation = await prisma.conversation.create(
            data={"roomName": "default", "users": {"connect": {"id": user_id}}}
        )

    return conversation.id


@app.get("/query/gemini_flash")
async def query_gemini_flash(
    query: str, emotion: str, current_user: User = Depends(get_current_user)
):
    response = gemini_flash_resp(query, emotion)

    model_id = await get_model_by_name("online", "gemini2_5_flash")
    conversation_id = await get_default_conversation(current_user.id)

    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )

    return {
        "query": query,
        "response": response,
        "model": "gemini_flash",
        "user": current_user.username,
        "query_id": query_resp.id,
    }


@app.post("/query/gemini_pro")
async def query_gemini_pro(
    data: ConvoModel, current_user: User = Depends(get_current_user)
):
    query = data.query
    emotion = data.emotion
    webSearch = data.webSearch
    conversation_id = data.Conversation_id

    search_context = ""

    conversation = await prisma.conversation.find_first(
        where={
            "id": conversation_id,
            "users": {"some": {"id": current_user.id}}
        }
    )
    
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found or access denied"
        )

    # search_context = ""
    try:
        if webSearch:
            search_results = await google_web_search(query, GOOGLE_API_KEY, GOOGLE_SEARCH_ENGINE_ID)
            if search_results and isinstance(search_results, list):
                search_context = "\n\nWeb Search Results:\n"
                for i, result in enumerate(search_results[:3], 1):
                    search_context += f"{i}. {result['title']}\n{result['snippet']}\n{result['link']}\n\n"
    except Exception as e:
        print(e)

    response = gemini_pro_resp(query, emotion, search_context)
    model_id = await get_model_by_name("online", "gemini2_5_pro")   

    existing_queries = await prisma.queryresp.count(
        where={"conversationId": conversation_id}
    )
    
    if existing_queries == 0:
        new_name = await generate_ai_conversation_name(query=query, response=response)
        await prisma.conversation.update(
            where={"id": conversation_id},
            data={"roomName": new_name}
        )

    query_resp = await prisma.queryresp.create(
        data={
            "query": query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )


    return {
        "query": query,
        "response": response,
        "model": "gemini_pro",
        "user": current_user.email,
        "query_id": query_resp.id,
        "conversation_id": conversation_id,
    }


@app.get("/query/ollama_gemma3")
async def query_ollama_gemma3(
    data: ConvoModel, current_user: User = Depends(get_current_user)
):
    response = ollama_gemma3_resp(data.query, data.emotion)

    model_id = await get_model_by_name("ollama", "gemma3_27b")
    conversation_id = await get_default_conversation(current_user.id)

    query_resp = await prisma.queryresp.create(
        data={
            "query": data.query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )

    return {
        "query": data.query,
        "response": response,
        "model": "ollama_gemma3",
        "user": current_user.username,
        "query_id": query_resp.id,
    }


@app.post("/query/ollama_llama3")
async def query_ollama_llama3(
    data: ConvoModel, current_user: User = Depends(get_current_user)
):
    response = ollama_llama3_resp(data.query, data.emotion)

    model_id = await get_model_by_name("ollama", "llama3_3_70b")
    conversation_id = await get_default_conversation(current_user.id)

    query_resp = await prisma.queryresp.create(
        data={
            "query": data.query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )

    return {
        "query": data.query,
        "response": response,
        "model": "ollama_llama3",
        "user": current_user.username,
        "query_id": query_resp.id,
    }


@app.post("/query/ollama_deepseek")
async def query_ollama_deepseek(
    data: ConvoModel, current_user: User = Depends(get_current_user)
):
    response = ollama_deepseek_resp(data.query, data.emotion)

    model_id = await get_model_by_name("ollama", "deepseek_r1_70b")
    conversation_id = await get_default_conversation(current_user.id)

    query_resp = await prisma.queryresp.create(
        data={
            "query": data.query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )

    return {
        "query": data.query,
        "response": response,
        "model": "ollama_deepseek",
        "user": current_user.username,
        "query_id": query_resp.id,
    }


@app.get("/query/ollama_phi")
async def query_ollama_phi(
    data: ConvoModel, current_user: User = Depends(get_current_user)
):
    response = ollama_phi_resp(data.query, data.emotion)

    model_id = await get_model_by_name("ollama", "phi4_14b")
    conversation_id = await get_default_conversation(current_user.id)

    query_resp = await prisma.queryresp.create(
        data={
            "query": data.query,
            "result": response,
            "userId": current_user.id,
            "modelId": model_id,
            "conversationId": conversation_id,
        }
    )

    return {
        "query": data.query,
        "response": response,
        "model": "ollama_phi",
        "user": current_user.username,
        "query_id": query_resp.id,
    }


@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.get("/auth/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/login/google")
async def signup(request: Request):
    redirect_uri = "http://localhost:8000/auth/google"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google")
async def auth_google(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        if not user_info:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        email = user_info.get("email")
        user = await prisma.user.find_first(where={"email": email})

        if not user:
            user = await prisma.user.create(
                data={
                    "email": email,
                    "name": user_info.get("name", email.split("@")[0]),
                    "authProvider": "google",
                    "passwordHash": ""
                }
            )

        access_token = await create_access_token(
            data={"sub": email},
            expiryTime=timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
        )

        html_content = f"""
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{ token: '{access_token}' }}, 'http://localhost:8080');
                    window.close();
                }} else {{
                    window.location.href = 'http://localhost:8080/auth/google?token={access_token}';
                }}
            </script>
        """
        return HTMLResponse(content=html_content)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login-jwt")
async def login_jwt(formData: UserLoginModel):
    user = await authenticate_user(formData.username, formData.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = await create_access_token(
        data={"sub": user.email},
        expiryTime=timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES)),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
async def register(user_data: UserModel):
    username = user_data.username
    print(username)
    email = user_data.email
    password = user_data.password
    try:
        existing_user = await prisma.user.find_unique(where={"email": email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # model User {
        # id    Int     @id @default(autoincrement())
        # email String  @unique
        # name  String?
        # passwordHash String?
        # authProvider AuthProvider
        # QueryResps QueryResp[]
        # messages Message[] @relation("MessageAuthor")
        # createdAt DateTime @default(now())
        # updatedAt DateTime @default(now())
        # conversations Conversation[] @relation("UserConversations")

        # @@index([email])
        # }

        hashed = hash_password(password)
        user = await prisma.user.create(
            data={
                "name": username,
                "email": email,
                "passwordHash": hashed,
                "authProvider": "jwt",
            }
        )

        return {
            "id": user.id,
            "username": user.name,
            "email": user.email,
            "authProvider": user.authProvider,
        }

    except Exception as e:
        print(e)
        if "already exists" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="http://localhost:8080")

@app.get("/conversations/{conversationId}/history")
async def get_conversation_history(conversation_id : int, current_user = Depends(get_current_user)):
    history = await prisma.queryresp.find_many(
        where = {
            "conversationId" : conversation_id,
            "userId" : current_user.id
        },
        order = {"createdAt" : "asc"}
    )

    return history

# @app.get("/conversations")
# async def get_conversation_user(current_user = Depends(get_current_user)):
#     conversations = await prisma.conversation.find_many(
#         where = {
#             "userId" : current_user.id
#         }
#     )

#     return conversations

@app.post("/process-file")
async def process_file(file: UploadFile = File(...), file_type: str = "pdf"):
    try:
        if file_type == "pdf":
            content = await file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            print(text)
            
            return {
                "content": text,
                "metadata": {
                    "page_count": len(pdf_reader.pages),
                    "word_count": len(text.split()),
                    "character_count": len(text)
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

#room logic
class ConversationRequest(BaseModel):
    userIds: List


@app.post("/conversation/")
async def create_conversation(request: ConversationRequest):  # basic implementation
    print(request.userIds)
    try:
        room_name = str(uuid.uuid4())

        users = await prisma.user.find_many(where={"id": {"in": request.userIds}})

        if len(users) != len(request.userIds):
            return JSONResponse(
                content={"message": "One or more users not found"}, status_code=404
            )

        new_conv = await prisma.conversation.create(
            data={
                "roomName": room_name,
                "users": {"connect": [{"id": user_id} for user_id in request.userIds]},
            }
        )

        return JSONResponse(
            content={
                "message": f"Conversation created successfully",
                "conversationId": new_conv.id,
                "roomName": room_name,
            },
            status_code=201,
        )
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return JSONResponse(
            content={"message": "Error creating conversation"}, status_code=500
        )


@app.get("/models/")
async def get_models():
    try:
        models = await prisma.model.find_many(where={"isActive": True})
        return JSONResponse(
            content={"message": "models available", "models": models},
            status_code=200,
        )
    except Exception as e:
        print(f"error fetching models: {e}")
        return JSONResponse(
            content={"message": "error fetching models"}, status_code=500
        )


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    type: str = "team"  # can be team, p2p(direct), ai_integrated
    pemails: List[str] = []


class MessageCreate(BaseModel):
    content: str
    conversation_id: int
    parent_message_id: Optional[int] = None
    ai: bool = False
    ai_model: Optional[str] = None


class TeamMessageRequest(BaseModel):
    content: str
    parent_message_id: Optional[int] = None
    ai: bool = False
    ai_model: Optional[str] = None


class EnableAIRequest(BaseModel):
    ai_e: bool  # basically the ai mode is enabled or not
    ai_model: Optional[str] = "gemini2_5_flash"


class AIMessageRequest(BaseModel):
    prompt: str
    model_type: str = "ollama"
    model_name: str = "deepseek_r1_70b"
    context_messages: Optional[str]


class InvitationCreate(BaseModel):
    email: str
    conversationId: Optional[int] = None
    message: Optional[str] = "Join pandra ***"


class MessageRequest(BaseModel):
    content: str
    conversationId: int
    userId: int
    parentMessageId: Optional[int] = None
    modelType: str = "ollama"
    modelName: str = "gemma3_27b"
    emotion: str = ""


class EditMessageRequest(BaseModel):
    messageId: int
    newContent: str
    userId: int
    editReason: Optional[str] = None
    emotion: Optional[str] = ""


class ConversationResponse(BaseModel):
    conversationId: int
    messages: List[dict]
    branchInfo: dict


async def generate_ai_response(
    content: str,
    emotion: str,
    model_type: str = None,
    model_name: str = None,
    model_id: int = None,
):
    model = None

    if model_id:
        model = await prisma.model.find_first(where={"modelId": model_id})

    if not model:
        if model_type == "ollama":
            model = await prisma.model.find_first(
                where={"type": "ollama", "name": model_name, "isActive": True}
            )
        else:
            model = await prisma.model.find_first(
                where={
                    "type": "online",
                    "nameOnline": model_name,
                    "isActive": True,
                }
            )

    if not model:
        model = await prisma.model.find_first(
            where={"type": "ollama", "name": "gemma3_27b", "isActive": True}
        )

    ai_response = ""
    if model.type == "ollama":
        if model.name == "gemma3_27b":
            ai_response = ollama_gemma3_resp(content, emotion)
        elif model.name == "llama3_3_70b":
            ai_response = ollama_llama3_resp(content, emotion)
        elif model.name == "deepseek_r1_70b":
            ai_response = ollama_deepseek_resp(content, emotion)
        elif model.name == "phi4_14b":
            ai_response = ollama_phi_resp(content, emotion)
    else:
        # enum ModelNameOnline {
        # gemini2_5_flash
        # gemini2_5_pro
        # deepseekv3
        # claude3_5
        # } for ref from schema
        if model.nameOnline == "gemini2_5_flash":
            ai_response = gemini_flash_resp(content, emotion)
        elif model.nameOnline == "gemini2_5_pro":
            ai_response = gemini_pro_resp(content, emotion)
        # elif model.nameOnline == "deepseekv3":
        #     ai_response =

    return ai_response, model


@app.post("/conversation/message/")
async def create_or_branch_message(request: MessageRequest):
    try:
        # validate user
        user = await prisma.user.find_first(where={"id": request.userId})
        if not user:
            return JSONResponse(content={"message": "user not found"}, status_code=404)

        conversation = await prisma.conversation.find_first(
            where={"id": request.conversationId}
        )
        if not conversation:
            conversation = await prisma.conversation.create(
                data={
                    "id": request.conversationId,  # Use the requested ID
                    "roomName": f"conversation_{request.conversationId}",
                    "users": {"connect": {"id": request.userId}},
                }
            )

        user_message = await prisma.message.create(
            data={
                "content": request.content,
                "role": "user",
                "conversationId": request.conversationId,
                "userId": request.userId,
                "parentMessageId": request.parentMessageId,
                "deletedAt": datetime.utcnow(),
            }
        )

        ai_response, model = await generate_ai_response(
            content=request.content,
            emotion=request.emotion,
            model_type=request.modelType,
            model_name=request.modelName,
        )

        ai_message = await prisma.message.create(
            data={
                "content": ai_response,
                "role": "assistant",
                "conversationId": request.conversationId,
                "userId": request.userId,
                "parentMessageId": user_message.id,
                "modelId": model.modelId,
                "deletedAt": datetime.utcnow(),
            }
        )

        return JSONResponse(
            content={
                "message": "messages created successfully",
                "conversationId": conversation.id,
                "userMessage": {
                    "id": user_message.id,
                    "content": user_message.content,
                    "role": user_message.role,
                    "parentMessageId": user_message.parentMessageId,
                },
                "aiMessage": {
                    "id": ai_message.id,
                    "content": ai_message.content,
                    "role": ai_message.role,
                    "parentMessageId": ai_message.parentMessageId,
                },
            },
            status_code=201,
        )

    except Exception as e:
        print(f"error creating message: {e}")
        return JSONResponse(
            content={"message": "error creating message"}, status_code=500
        )


@app.post("/conversation/message/edit/")
async def edit_message_and_branch(request: EditMessageRequest):
    # edit message
    try:
        user = await prisma.user.find_first(where={"id": request.userId})
        if not user:
            return JSONResponse(content={"message": "user not found"}, status_code=404)

        original_message = await prisma.message.find_first(
            where={"id": request.messageId}
        )
        if not original_message:
            return JSONResponse(
                content={"message": "message not found"}, status_code=404
            )

        # storring original content
        await prisma.message.update(
            where={"id": request.messageId},
            data={
                "isEdited": True,
                "originalContent": (
                    original_message.content
                    if not original_message.isEdited
                    else original_message.originalContent
                ),
            },
        )

        # creating new edited message
        edited_message = await prisma.message.create(
            data={
                "content": request.newContent,
                "role": original_message.role,
                "conversationId": original_message.conversationId,
                "userId": request.userId,
                "parentMessageId": original_message.parentMessageId,
                "editReason": request.editReason or "user edit",
                "deletedAt": datetime.utcnow(),
                "isEdited": True,
            }
        )

        ai_message = None
        original_ai_message = await prisma.message.find_first(
            where={"parentMessageId": request.messageId, "role": "assistant"}
        )

        original_model_id = original_ai_message.modelId if original_ai_message else None
        ai_response, model = await generate_ai_response(
            content=request.newContent,
            emotion=request.emotion,
            model_id=original_model_id,
        )

        ai_message = await prisma.message.create(
            data={
                "content": ai_response,
                "role": "assistant",
                "conversationId": original_message.conversationId,
                "userId": request.userId,
                "parentMessageId": edited_message.id,
                "modelId": model.modelId,
                "deletedAt": datetime.utcnow(),
            }
        )

        response_content = {
            "message": "message edited successfully",
            "originalMessage": {
                "id": original_message.id,
                "content": original_message.content,
                "isEdited": True,
            },
            "editedMessage": {
                "id": edited_message.id,
                "content": edited_message.content,
            },
        }
        response_content["conversationId"] = original_message.conversationId
        if ai_message:
            response_content["aiMessage"] = {
                "id": ai_message.id,
                "content": ai_message.content,
                "role": ai_message.role,
                "parentMessageId": ai_message.parentMessageId,
            }

        return JSONResponse(
            content=response_content,
            status_code=201,
        )

    except Exception as e:
        print(f"error editing message: {e}")
        return JSONResponse(
            content={"message": "error editing message"}, status_code=500
        )


@app.get("/conversation/{conversation_id}/tree")
async def get_conversation_tree(
    conversation_id: int,
):
    # get complete conversation tree with all branches
    try:
        conversation = await prisma.conversation.find_first(
            where={"id": conversation_id}
        )
        if not conversation:
            return JSONResponse(
                content={"message": "conversation not found"}, status_code=404
            )
        print("start")
        messages = await prisma.message.find_many(
            where={"conversationId": conversation_id},
            # include={
            #     "user": {"select": {"id": True, "name": True}},
            #     # "model": {
            #     #     "select": {"modelId": True, "name": True, "nameOnline": True}
            #     # },
            # },
            order={"createdAt": "asc"},
        )
        # print(messages)

        # building a tree which works need to be tested more
        def build_tree(parent_id=None):
            tree = []
            for message in messages:
                if message.parentMessageId == parent_id:
                    message_data = {
                        "id": message.id if message else None,
                        "content": message.content,
                        "role": message.role,
                        "isEdited": message.isEdited,
                        "originalContent": message.originalContent,
                        "editReason": message.editReason,
                        "createdAt": message.createdAt.isoformat(),
                        # "user": {"id": message.user.id, "name": message.user.name},
                        "model": (
                            {
                                "id": message.model.modelId if message.model else None,
                                "name": message.model.name if message.model else None,
                            }
                            if message.model
                            else None
                        ),
                        "children": build_tree(message.id),
                    }
                    tree.append(message_data)
            return tree

        message_tree = build_tree()

        return JSONResponse(
            content={
                "conversationId": conversation_id,
                "roomName": conversation.roomName,
                "messageTree": message_tree,
            },
            status_code=200,
        )

    except Exception as e:
        print(f"error fetching conversation tree: {e}")
        return JSONResponse(
            content={"message": "error fetching conversation"}, status_code=500
        )


@app.get("/conversation/message/{message_id}/branches")
async def get_message_branches(message_id: int):
    # get all branch variations of a message
    try:
        message = await prisma.message.find_first(
            where={"id": message_id},
            # include={
            #     "user": {"select": {"id": True, "name": True}},
            #     "model": {"select": {"modelId": True, "name": True}},
            # },
        )

        if not message:
            return JSONResponse(
                content={"message": "message not found"}, status_code=404
            )

        siblings = await prisma.message.find_many(
            where={"parentMessageId": message.parentMessageId},
            # include={
            #     "user": {"select": {"id": True, "name": True}},
            #     "model": {"select": {"modelId": True, "name": True}},
            # },
            order={"createdAt": "asc"},
        )
        print(siblings)
        branches = []
        for sibling in siblings:
            branch_data = {
                "id": sibling.id,
                "content": sibling.content,
                "role": sibling.role,
                "isEdited": sibling.isEdited,
                "originalContent": sibling.originalContent,
                "editReason": sibling.editReason,
                "isOriginal": sibling.id == message_id,
                "createdAt": sibling.createdAt.isoformat(),
                # "user": {"id": sibling.user.id, "name": sibling.user.name},
                "model": (
                    {
                        "id": sibling.model.modelId if sibling.model else None,
                        "name": sibling.model.name if sibling.model else None,
                    }
                    if sibling.model
                    else None
                ),
            }
            branches.append(branch_data)

        return JSONResponse(
            content={
                "messageId": message_id,
                "totalBranches": len(branches),
                "branches": branches,
            },
            status_code=200,
        )

    except Exception as e:
        print(f"error fetching message branches: {e}")
        return JSONResponse(
            content={"message": "error fetching branches"}, status_code=500
        )


class UserInvite(BaseModel):
    email: str


@app.post("/conversation/invite")
async def invite_to_conversation_via_mail(
    data: UserInvite,
    current_user: User = Depends(get_current_user),
):
    user = await prisma.user.find_first(where={"email": data.email})

    if not user:
        return JSONResponse(content={"message": "user not found"}, status_code=404)

    roomId = current_user.currentConversationId
    if not roomId:
        return JSONResponse(
            content={"message": "conversation not found"}, status_code=404
        )
    
async def get_default_conversation(user_id: int) -> int:
    conversation = await prisma.conversation.find_first(
        where={"users": {"some": {"id": user_id}}, "roomName": "default"}
    )

    if not conversation:
        conversation = await prisma.conversation.create(
            data={"roomName": "default", "users": {"connect": {"id": user_id}}}
        )
    return conversation.id

class ConversationCreateModel(BaseModel):
    name: str
    model: str

@app.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user)):
    try:
        conversations = await prisma.conversation.find_many(
            where={
                "users": {
                    "some": {
                        "id": current_user.id
                    }
                }
            }
        )
        
        # Transform the response to match your frontend expectations
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append({
                "id": conv.id,
                "room_name": conv.roomName,
                "last_message_at": conv.lastMessageAt.isoformat() if conv.lastMessageAt else None,
                "ai_model": conv.aiModel,
                "type": conv.type,
                "aiEnabled": conv.aiEnabled,
                "created_at": conv.createdAt.isoformat() if conv.createdAt else None
            })
        
        return formatted_conversations
        
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversations: {str(e)}"
        )

@app.post("/conversations/new")
async def create_new_conversation(
    data: ConversationCreateModel, 
    current_user: User = Depends(get_current_user)
):
    try:
        conversation = await prisma.conversation.create(
            data={
                "roomName": data.name,
                "type": "ai_enabled",
                "aiEnabled": True,
                "aiModel": data.model,
                "users": {"connect": {"id": current_user.id}}
            }
        )
        
        await prisma.user.update(
            where={"id": current_user.id},
            data={"currentCoversationId": conversation.id}  # Note: Fix typo "Coversation" -> "Conversation"
        )

        return {
            "conversation_id": conversation.id,
            "room_name": conversation.roomName,
            "created_at": conversation.createdAt.isoformat() if conversation.createdAt else None
        }
    except Exception as e:
        print(f"Error creating conversation: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create conversation: {str(e)}"
        )

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, current_user: User = Depends(get_current_user)):
    try:
        conversation = await prisma.conversation.find_unique(
            where={"id": conversation_id}
        )

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        await prisma.conversation.delete(where={"id": conversation_id})

        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        print(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")

class ProjectBuilderReq(BaseModel):
    stack_id : str
    prompt : str
    email : str

STACK_SCRIPTS = {
    'mern': 'alphamern.py',
    'nextjs': 'alphanextjsprisma.py', 
    'django-react': 'alphadjango.py',
    'rust-solana-dapp': 'alpharust.py',
    'vue-nuxt': 'alphavue.py',
    'svelte-kit': 'alphasvelte.py',
    'go-gin-stack': 'alphago.py',
    't3-stack': 'alphat3.py',
    'flutter-firebase': 'alphaflutter.py'
}

async def process_project_generation(stack_id: str, project_id: str, email: str, enhanced_prompt: str):
    try:
        project_dir = f"generated_projects/{project_id}"
        os.makedirs(project_dir, exist_ok=True)
        
        script_name = STACK_SCRIPTS[stack_id]
        script_path = f"project_builder_codes/{script_name}"
        
        await run_generation_script(script_path, project_dir, enhanced_prompt)
        
        zip_path = f"{project_dir}.zip"
        create_zip_file(project_dir, zip_path)
        
        await send_project_email(email, zip_path, project_id, stack_id)
        
        cleanup_files(project_dir, zip_path)
        
    except Exception as e:
        await send_error_email(email, project_id, str(e))
        print(f"Error in project generation: {e}")

async def run_generation_script(script_path: str, output_dir: str, prompt: str):
    try:
        prompt_file = f"{output_dir}/prompt.txt"
        with open(prompt_file, 'w') as f:
            f.write(prompt)
        
        process = await asyncio.create_subprocess_exec(
            'python', script_path, output_dir, prompt_file,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.getcwd()
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Script execution failed: {stderr.decode()}")
            
        os.remove(prompt_file)
        
    except Exception as e:
        raise Exception(f"Failed to run generation script: {str(e)}")

def create_zip_file(source_dir: str, zip_path: str):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

async def send_project_email(email: str, zip_path: str, project_id: str, stack_id: str):
    try:
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        sender_email = os.getenv('SENDER_EMAIL')
        sender_password = os.getenv('SENDER_PASSWORD')
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = f"Your {stack_id.upper()} Project is Ready! 🚀"
        
        body = f"""
        Hi there! 👋

        Your {stack_id.upper()} project has been generated successfully!

        Project ID: {project_id}
        Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Please find your complete project attached as a ZIP file.

        What's included:
        ✅ Complete project structure
        ✅ All necessary configuration files
        ✅ Dependencies and requirements
        ✅ README with setup instructions

        Note: This is a beta service - minor import adjustments may be needed.

        Happy coding! 🎉

        Best regards,
        Your Project Generator Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        with open(zip_path, "rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename= {project_id}.zip'
        )
        msg.attach(part)
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

async def send_error_email(email: str, project_id: str, error_message: str):
    try:
        pass
    except Exception as e:
        print(f"Failed to send error email: {e}")

def cleanup_files(project_dir: str, zip_path: str):
    try:
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)
        if os.path.exists(zip_path):
            os.remove(zip_path)
    except Exception as e:
        print(f"Cleanup failed: {e}")

@app.post("/run_project_builder")
async def project_builder(data : ProjectBuilderReq, background_tasks: BackgroundTasks = BackgroundTasks()):
    try:
        stack_id = data.stack_id
        prompt = data.prompt
        email = data.email

        user = await prisma.user.find_first(
            where={
                "email": email
            }
        )

        if not user:
            raise HTTPException(status_code=400, detail="User not found. Please sign up first.")

        if stack_id not in STACK_SCRIPTS:
            raise HTTPException(status_code=400, detail=f"Will be adding the scripts for this stack soon...")
        
        project_id = f"{stack_id}_{uuid.uuid4().hex[:8]}_{int(datetime.now().timestamp())}"
    
        background_tasks.add_task(
            process_project_generation,
            stack_id=stack_id,
            project_id=project_id,
            email=email,
            enhanced_prompt=prompt
        )
        
        return {
            "message": "Project generation started successfully",
            "project_id": project_id,
            "estimated_time": "~40 minutes",
            "status": "processing"
        }
    except Exception as e:
        print(f"Error generating project: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate project")


