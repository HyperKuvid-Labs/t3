from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing_extensions import List, Literal
import json
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import google.generativeai as genai
import string
import json
from tqdm import tqdm
import subprocess
from prisma import Prisma
import asyncio
import bcrypt
import uuid

app = FastAPI()

prisma = Prisma()

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
    await prisma.connect()
    print("Prisma gracefully disconnected. Thank You!")


# models
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

genai.configure(api_key="AIzaSyA3fmU_TKoGeMoK02_9M48juoe0fR4Dt6w")


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


def gemini_pro_resp(query: str, emotion: str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

    if emotion:
        prompt += f"\n\nEmotion: {emotion}. Respond accordingly."

    resp = genai.GenerativeModel("gemini-2.5-pro-preview-05-06").generate_content(
        contents=prompt
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

# ollama models chosen - gemma3:27b, llama3.3:70b, deepseek-r1:70b, phi4:14b, need this for schema


def ollama_gemma3_resp(query: str, emotion: str):
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


def ollama_llama3_resp(query: str, emotion: str):
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


def ollama_phi_resp(query: str, emotion: str):
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


@app.get("/")
def Welcome():
    return Response("Welcome to t3!")


@app.get("/query/gemini_flash")
def query_gemini(query: str, emotion: str):
    return {
        "query": query,
        "response": gemini_flash_resp(query, emotion),
    }


@app.get("/query/gemini_pro")
def query_gemini(query: str, emotion: str):
    return {
        "query": query,
        "response": gemini_pro_resp(query, emotion),
    }


@app.get("/query/ollama_gemma3")
def query_ollama(query: str, emotion: str):
    return {
        "query": query,
        "response": ollama_gemma3_resp(query, emotion),
    }


@app.get("/query/ollama_llama3")
def query_ollama(query: str, emotion: str):
    return {
        "query": query,
        "response": ollama_llama3_resp(query, emotion),
    }


@app.get("/query/ollama_deepseek")
def query_ollama(query: str, emotion: str):
    return {
        "query": query,
        "response": ollama_deepseek_resp(query, emotion),
    }


@app.get("/query/ollama_phi")
def query_ollama(query: str, emotion: str):
    return {
        "query": query,
        "response": ollama_phi_resp(query, emotion),
    }


class UserSignUpRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/user/sign-up")
async def sign_up(request: UserSignUpRequest):

    try:
        existing_user = await prisma.user.find_first(where={"email": request.email})
        if existing_user:
            return JSONResponse({"message": "user already exist"})

        hashed_password = bcrypt.hashpw(
            request.password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        new_user = await prisma.user.create(
            data={
                "name": request.name,
                "email": request.email,
                "passwordHash": hashed_password,
            }
        )
        return JSONResponse(
            {"message": f"user created successfully with id {new_user.id}"},
            status_code=201,
        )
    except Exception as e:
        print(f"error creating user: {e}")
        return JSONResponse({"message": "error creating user"}, status_code=500)


class UserSignInRequest(BaseModel):
    email: str
    password: str


@app.post("/user/sign-in")
async def sign_in(request: UserSignInRequest):
    try:
        existing_user = await prisma.user.find_first(where={"email": request.email})

        if not existing_user:
            return JSONResponse(
                content={"message": "invalid credentials"}, status_code=500
            )
        if existing_user and bcrypt.checkpw(
            request.password.encode("utf-8"), existing_user.passwordHash.encode("utf-8")
        ):
            return JSONResponse({"message": "login successfull"}, status_code=201)
        else:
            return JSONResponse(
                content={"message": "Invalid Password"},
                status_code=500,
            )

    except Exception as e:
        return JSONResponse(
            content={"message": "Failed to login"},
            status_code=500,
        )


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


class QueryRequest(BaseModel):
    query: str
    emotion: str = ""
    modelType: str = "ollama"  # "ollama" or "online"
    modelName: str = "gemma3_27b"
    conversationId: int
    userId: int


class QueryRequest(BaseModel):
    query: str
    emotion: str = ""
    modelType: str
    modelName: str = "gemma3_27b"
    conversationId: int
    userId: int


@app.post("/query/")
async def create_query(request: QueryRequest):
    # try:
    user = await prisma.user.find_first(where={"id": request.userId})

    if not user:
        return JSONResponse(content={"message": "user not found"}, status_code=500)

    conversation = await prisma.conversation.find_first(
        where={"id": request.conversationId}
    )

    # if not conversation:
    #     return JSONResponse(
    #         content={"message": "conversation not found"}, status_code=500
    #     )
    # print("bkkjdmk", conversation.users)
    # user_in_conversaton = any(u.id == request.userId for u in conversation.users)

    # if not user_in_conversaton:
    #     return JSONResponse(
    #         content={"message": "user not in conversation"}, status_code=500
    #     )
    # print("kbdchjk", user_in_conversaton)
    if request.modelType == "ollama":
        model = await prisma.model.find_first(
            where={"type": "ollama", "name": request.modelName, "isActive": True}
        )

    else:
        model = await prisma.model.find_first(
            where={
                "type": "online",
                "nameOnline": request.modelName,
                "isActive": True,
            }
        )
    if not model:
        return JSONResponse(content={"message": "model not found"}, status_code=500)
    print("bkkjdmk", model)
    if request.modelType == "ollama":

        if model.name == "gemma3_27b":
            response = ollama_gemma3_resp(request.query, request.emotion)
        elif model.name == "llama3.3_70b":
            response = ollama_llama3_resp(request.query, request.emotion)
        elif model.name == "deepseek-r1_70b":
            response = ollama_deepseek_resp(request.query, request.emotion)
        elif model.name == "phi4_14b":
            response = ollama_phi_resp(request.query, request.emotion)
        else:
            return JSONResponse(
                content={
                    "message": f"model not supported, modelName:{request.modelName}"
                },
                status_code=500,
            )
    else:
        if request.modelName == "gemini2_5_flash":
            response = gemini_flash_resp(request.query, request.emotion)
        elif request.modelName == "gemini2_5_pro":
            response = gemini_pro_resp(request.query, request.emotion)
        else:
            return JSONResponse(
                content={
                    "message": f"model not supported, modelName:{request.modelName}"
                },
                status_code=500,
            )

    query_resp = await prisma.queryresp.create(
        data={
            "query": request.query,
            "result": response,
            "modelId": model.modelId,
            "userId": request.userId,
            "conversationId": request.conversationId,
        }
    )

    return JSONResponse(
        content={
            "queryId": query_resp.id,
            "query": request.query,
            "response": response,
            "model": request.modelName,
        },
        status_code=201,
    )
    # except Exception as e:
    #     print(f"error creating query: {e}")
    #     return JSONResponse(
    #         content={"message": "error processing query"}, status_code=500
    #     )
