from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import ChatWithSql
from app.config import settings

app = FastAPI(title="Chat with SQL API")

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    db_uri: str
    query: str

@app.post('/send-message')
async def send_message(request: QueryRequest):
    try:
        chat_obj = ChatWithSql(db_uri=request.db_uri)
        response = chat_obj.message(request.query)
        return {"message": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))