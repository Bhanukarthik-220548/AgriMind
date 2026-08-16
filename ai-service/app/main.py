import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import io
import json
from sentence_transformers import SentenceTransformer
import chromadb
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel

app = FastAPI(title="AgriMind AI Service")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "rice_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")
CHROMA_DB_PATH = os.path.join(BASE_DIR, "chroma_db")

load_dotenv()

# Load model and class names once on startup
try:
    print(f"Loading model from: {MODEL_PATH}")
    MODEL = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={'preprocess_input': preprocess_input}
    )
    
    with open(CLASS_NAMES_PATH, "r") as f:
        CLASS_NAMES = json.load(f)
    print("✅ Model Loaded Successfully")
except Exception as e:
    print(f"Error loading model or class names: {e}")
    MODEL = None
    CLASS_NAMES = None

# RAG Setup
try:
    print(f"Loading ChromaDB from: {CHROMA_DB_PATH}")
    db_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = db_client.get_collection("rice_knowledge")
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    llm = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    print("✅ RAG components Loaded Successfully")
except Exception as e:
    print(f"Error loading RAG components: {e}")
    db_client = None
    collection = None
    embedding_model = None
    llm = None

class RAGRequest(BaseModel):
    question: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if MODEL is None or CLASS_NAMES is None:
        raise HTTPException(status_code=503, detail="Model not loaded correctly on server startup.")

    try:
        # Read uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Resize to 224x224
        image = image.resize((224, 224))
        
        # Convert to a NumPy array
        img_array = np.array(image, dtype=np.float32)
        
        # Add the batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        # Run model.predict()
        predictions = MODEL.predict(img_array)[0]
        
        # Map the predicted index using class_names.json
        top_indices = np.argsort(predictions)[::-1]
        
        top_3 = []
        for i in top_indices[:3]:
            # Handle potential dictionary formats for class_names
            if isinstance(CLASS_NAMES, dict):
                label = CLASS_NAMES.get(str(i), list(CLASS_NAMES.keys())[i] if i < len(CLASS_NAMES) else str(i))
            else:
                label = CLASS_NAMES[i]
            
            top_3.append({
                "label": label,
                "confidence": float(predictions[i] * 100)
            })
            
        predicted_index = top_indices[0]
        predicted_class = top_3[0]["label"]
        confidence = float(predictions[predicted_index])
        
        # Split crop and disease from label if format is "Crop_Disease"
        crop = "Rice"
        disease = predicted_class
        
        crop = "Rice"
        disease = predicted_class
        return {
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "top_3": top_3,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/ask")
def ask_rag_endpoint(req: RAGRequest):
    if collection is None or llm is None or embedding_model is None:
        raise HTTPException(status_code=503, detail="RAG components not loaded.")

    try:
        question_embedding = embedding_model.encode(req.question)
        results = collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=5
        )

        context = "\n\n".join(results["documents"][0])

        prompt = f"""
        You are an agricultural expert.

        Answer ONLY using the context below.

        If the answer is not present in the context, reply:
        "I don't know."

        Context:
        {context}

        Question:
        {req.question}

        Answer:
        """

        response = llm.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
