import os
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
import chromadb
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel

app = FastAPI(title="AgriMind RAG Service")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DB_PATH = os.path.join(BASE_DIR, "chroma_db")

load_dotenv()

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
