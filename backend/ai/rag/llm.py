import chromadb
from google import genai
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

load_dotenv()

llm = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("rice_knowledge")

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

question = input("Ask a question: ")


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

response = llm.models.generate_content(
    model="gemini-3.6-flash",
    contents=prompt
)

print(response.text)