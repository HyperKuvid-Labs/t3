from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing_extensions import List, Literal
from typing import Optional
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
        if model.nameOnline == "gemini2_5_flash":
            ai_response = gemini_flash_resp(content, emotion)
        elif model.nameOnline == "gemini2_5_pro":
            ai_response = gemini_pro_resp(content, emotion)

    return ai_response, model


@app.post("/conversation/message/")
async def create_or_branch_message(request: MessageRequest):
    # create conversation from start or or branch
    try:
        # validate user and conversation
        user = await prisma.user.find_first(where={"id": request.userId})
        if not user:
            return JSONResponse(content={"message": "user not found"}, status_code=404)

        conversation = await prisma.conversation.find_first(
            where={"id": request.conversationId}
        )
        if not conversation:
            return JSONResponse(
                content={"message": "conversation not found"}, status_code=404
            )

        user_message = await prisma.message.create(
            data={
                "content": request.content,
                "role": "user",
                "conversationId": request.conversationId,
                "userId": request.userId,
                "parentMessageId": request.parentMessageId,
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
            }
        )

        return JSONResponse(
            content={
                "message": "messages created successfully",
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
async def get_conversation_tree(conversation_id: int, user_id: int):
    # get complete conversation tree with all branches
    try:
        conversation = await prisma.conversation.find_first(
            where={"id": conversation_id}
        )
        if not conversation:
            return JSONResponse(
                content={"message": "conversation not found"}, status_code=404
            )

        messages = await prisma.message.find_many(
            where={"conversationId": conversation_id},
            include={
                "user": {"select": {"id": True, "name": True}},
                "model": {
                    "select": {"modelId": True, "name": True, "nameOnline": True}
                },
            },
            order={"createdAt": "asc"},
        )

        # building a tree which works need to be tested more
        def build_tree(parent_id=None):
            tree = []
            for message in messages:
                if message.parentMessageId == parent_id:
                    message_data = {
                        "id": message.id,
                        "content": message.content,
                        "role": message.role,
                        "isEdited": message.isEdited,
                        "originalContent": message.originalContent,
                        "editReason": message.editReason,
                        "createdAt": message.createdAt.isoformat(),
                        "user": {"id": message.user.id, "name": message.user.name},
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
            include={
                "user": {"select": {"id": True, "name": True}},
                "model": {"select": {"modelId": True, "name": True}},
            },
        )

        if not message:
            return JSONResponse(
                content={"message": "message not found"}, status_code=404
            )

        siblings = await prisma.message.find_many(
            where={"parentMessageId": message.parentMessageId},
            include={
                "user": {"select": {"id": True, "name": True}},
                "model": {"select": {"modelId": True, "name": True}},
            },
            order={"createdAt": "asc"},
        )

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
                "user": {"id": sibling.user.id, "name": sibling.user.name},
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
