from fastapi import FastAPI, Request, Response
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

genai.configure(api_key="get_your_api_key")

def gemini_flash_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        Answer it more breifly and in a way any layman can understand if any complex topics arise.

        Otherwise maintain the tempo jovially, and make it sound like a conversation between two friends.
    """

    resp = genai.GenerativeModel("gemini-2.5-flash-preview-05-20").generate_content(
        contents = prompt
    )

    return resp.text

def gemini_pro_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

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


def ollama_gemma3_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        Answer it more breifly and in a way any layman can understand if any complex topics arise.

        Otherwise maintain the tempo jovially, and make it sound like a conversation between two friends.
    """

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
    
def ollama_llama3_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        Imagine you are a genius and a friendly conversationalist.

        So explain them in a way that is easy to understand and maintain the tempo jovially.
    """

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
    
def ollama_deepseek_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        You are DeepSeek — sharp, calm, and precise, with a hint of Chinese-accented clarity.

        Explain with strong logic, clean structure, and a friendly but formal tone.
    """

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
    

def ollama_phi_resp(query : str):
    prompt = f"""
        This is the query from the user: {query}

        You are concise, warm, and highly efficient in communication.

        Explain things simply, step by step, as if teaching someone new but curious.
    """

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
    return Response("Welcome to Gidvion!")

@app.get("/query/gemini_flash")
def query_gemini(query : str):
    return {
        "query": query,
        "response": gemini_flash_resp(query),
    }

@app.get("/query/gemini_pro")
def query_gemini(query : str):
    return {
        "query": query,
        "response": gemini_pro_resp(query),
    }

@app.get("/query/ollama_gemma3")
def query_ollama(query : str):
    return {
        "query": query,
        "response": ollama_gemma3_resp(query),
    }

@app.get("/query/ollama_llama3")
def query_ollama(query : str):
    return {
        "query": query,
        "response": ollama_llama3_resp(query),
    }

@app.get("/query/ollama_deepseek")
def query_ollama(query : str):
    return {
        "query": query,
        "response": ollama_deepseek_resp(query),
    }

@app.get("/query/ollama_phi")
def query_ollama(query : str):
    return {
        "query": query,
        "response": ollama_phi_resp(query),
    }





