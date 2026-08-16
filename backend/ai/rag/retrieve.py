import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_collection("rice_knowledge")

question = input("Ask a question: ")

question_embedding = model.encode(question)

results = collection.query(
    query_embeddings=[question_embedding.tolist()],
    n_results=3
)

print("\nTop Retrieved Chunks:\n")

for i, doc in enumerate(results["documents"][0], start=1):
    print(f"Chunk {i}:\n")
    print(doc)
    print("-" * 50)
