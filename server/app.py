# FastAPI 主应用
from dotenv import load_dotenv
load_dotenv('../.env')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat, usage, admin
from websocket import chat_handler

app = FastAPI(title="AI Coach API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# WebSocket
app.add_websocket_route("/ws/chat", chat_handler.websocket_endpoint)

@app.get("/")
def read_root():
    return {"message": "AI Coach API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
