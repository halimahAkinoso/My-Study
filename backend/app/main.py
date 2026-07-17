from app.database.init_db import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.routers import subjects
from app.routers import topics
from app.routers import lessons
from app.routers import quiz
from app.routers import ai

app = FastAPI(
    title="StudyHub API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "https://my-study-dun.vercel.app",
    "https://my-study-git-master-halimah-akinosos-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(topics.router)

app.include_router(lessons.router)
app.include_router(quiz.router)
app.include_router(ai.router)
@app.get("/")
def root():
    return {
        "message": "Welcome to StudyHub API"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.on_event("startup")
def startup():
    init_db()
    