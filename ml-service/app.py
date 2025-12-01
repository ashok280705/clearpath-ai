# ml-service/app.py
import io, os, time, base64, json, re, traceback
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="ClearPath Gemini Service")

class DetectionBox(BaseModel):
    label: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float

class DetectResponse(BaseModel):
    detections: List[DetectionBox]
    elapsed: float
    meta: Dict[str, Any] = {}

def pil_image_from_bytes(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGB")

@app.get("/health")
def health():
    return {"status": "ok" if GEMINI_API_KEY else "api_key_missing"}

@app.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...),
                 lat: Optional[float] = Form(None),
                 lon: Optional[float] = Form(None),
                 conf_threshold: Optional[float] = Form(None)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key missing")
    
    t0 = time.time()
    contents = await file.read()
    
    try:
        img = pil_image_from_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """Analyze this image and determine if it contains garbage, pollution, or waste.
        
If garbage/pollution is detected, respond ONLY with JSON (no markdown):
{"has_garbage": true, "items": ["item1", "item2"], "confidence": 0.9, "description": "brief description"}

If NO garbage/pollution is detected, respond ONLY with JSON (no markdown):
{"has_garbage": false, "items": [], "confidence": 0.0, "description": "no pollution detected"}

Only detect actual garbage, waste, pollution, litter, trash. Do not detect clean objects or people."""
        
        response = model.generate_content([prompt, img])
        result_text = response.text.strip()
        
        print(f"Gemini raw response: {result_text}")
        
        # Extract JSON from response
        json_match = re.search(r'\{[^}]+\}', result_text, re.DOTALL)
        if json_match:
            result_text = json_match.group(0)
        
        result = json.loads(result_text)
        print(f"Parsed result: {result}")
        
        detections = []
        if result.get('has_garbage', False):
            for item in result.get('items', []):
                detections.append({
                    "label": f"garbage-{item}",
                    "confidence": result.get('confidence', 0.8),
                    "x1": 0.0, "y1": 0.0,
                    "x2": 100.0, "y2": 100.0
                })
        
        print(f"Final detections: {detections}")
        
        elapsed = time.time() - t0
        return {
            "detections": detections,
            "elapsed": elapsed,
            "meta": {"lat": lat, "lon": lon, "description": result.get('description', '')}
        }
        
    except Exception as e:
        print(f"Gemini error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
