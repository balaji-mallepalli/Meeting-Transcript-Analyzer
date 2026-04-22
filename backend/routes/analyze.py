from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import StreamingResponse
from typing import Optional
import asyncio
import json

from models.schemas import TextInput, AnalysisResult
from nlp.pipeline import run_analysis

router = APIRouter()

# In-memory queues for SSE: task_id -> asyncio.Queue
progress_queues = {}

async def progress_callback(task_id: str, step: str, percent: int):
    if task_id in progress_queues:
        data = {"step": step, "percent": percent}
        await progress_queues[task_id].put(data)

async def process_text(text: str, task_id: Optional[str]):
    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text must be at least 50 characters long.")
        
    if task_id:
        if task_id not in progress_queues:
            progress_queues[task_id] = asyncio.Queue()
            
    try:
        # Note: Analysis functions blocking event-loop are wrapped in to_thread, 
        # so this coroutine won't fully block the SSE GET requests
        result = await run_analysis(text, task_id, progress_callback)
        if hasattr(result, "get") and result.get("error"):
             raise HTTPException(status_code=500, detail=result.get("error"))
        return result
    except Exception as e:
        if task_id in progress_queues:
            await progress_queues[task_id].put({"step": f"error: {str(e)}", "percent": 100})
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze", response_model=AnalysisResult)
async def analyze_file(
    file: UploadFile = File(...), 
    task_id: Optional[str] = Form(None)
):
    if not file.filename.endswith(".txt"):
         raise HTTPException(status_code=400, detail="Only .txt files are allowed.")
         
    try:
        content = await file.read()
        text = content.decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File read error: {e}")
        
    return await process_text(text, task_id)

@router.post("/api/analyze-text", response_model=AnalysisResult)
async def analyze_raw_text(
    payload: TextInput,
    task_id: Optional[str] = None
):
    return await process_text(payload.text, task_id)

@router.get("/api/progress/{task_id}")
async def get_progress(task_id: str, request: Request):
    if task_id not in progress_queues:
        progress_queues[task_id] = asyncio.Queue()
        
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                    
                try:
                    data = await asyncio.wait_for(progress_queues[task_id].get(), timeout=1.0)
                    yield f"data: {json.dumps(data)}\n\n"
                    if data["step"] == "done" or str(data["step"]).startswith("error"):
                        break
                except asyncio.TimeoutError:
                    continue
        finally:
            if task_id in progress_queues:
                del progress_queues[task_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")
