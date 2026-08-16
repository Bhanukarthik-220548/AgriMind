from sentence_transformers import SentenceTransformer
import chromadb
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "gemini-3.6-flash"
embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

db_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = db_client.get_collection("rice_knowledge")

llm = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def ask_rag(question):

    """
    Retrieves relevant chunks from ChromaDB
    and asks Gemini to answer using only
    the retrieved context.
    """

    question_embedding = embedding_model.encode(question)
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
    {question}

    Answer:
    """

    try:
        response = llm.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

    import time

    start = time.time()

    question_embedding = embedding_model.encode(question)
    print("Embedding:", time.time() - start)

    start = time.time()

    results = collection.query(...)
    print("Retrieval:", time.time() - start)

    start = time.time()

    response = llm.models.generate_content(...)
    print("Gemini:", time.time() - start)
