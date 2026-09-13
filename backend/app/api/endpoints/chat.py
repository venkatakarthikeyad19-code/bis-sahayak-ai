from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm_service import generate_bis_assistant_response

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    try:
        response = await generate_bis_assistant_response(request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
