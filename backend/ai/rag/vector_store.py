import fitz
import chromadb
from sentence_transformers import SentenceTransformer

# Load the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Read PDF
doc = fitz.open("../knowledge/paddy.pdf")
text = ""
for page in doc:
    text += page.get_text()

# Split into chunks
import re
lines = text.split("\n")
chunks = []
current_chunk = ""

for line in lines:
    if re.match(r"^\d+\.\d+", line):
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        current_chunk = line + "\n"
    else:
        current_chunk += line + "\n"

if current_chunk.strip():
    chunks.append(current_chunk.strip())

# Generate embeddings
embeddings = model.encode(chunks)

client=chromadb.PersistentClient(path="./chroma_db")

collection=client.get_or_create_collection(
    name="rice_knowledge"
)

for i,chunk in enumerate(chunks):
    collection.add(
        ids=[str(i)],
        documents=[chunk],
        embeddings=[embeddings[i].tolist()],
        metadatas=[
            {
                "source":"ICAR Rice Book"
            }
        ]
    )

print(collection.count())