import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import io
import json

app = FastAPI(title="AgriMind AI Service")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "rice_disease_model.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

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
    CLASS_NAMES = None

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

# TODO: Initialize RAG pipeline and related routes here
