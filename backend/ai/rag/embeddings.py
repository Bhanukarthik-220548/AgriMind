import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Read PDF
doc = fitz.open("../knowledge/paddy.pdf")

text = ""

for page in doc:
    text += page.get_text()

# Split text
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = splitter.split_text(text)

print(f"Chunks: {len(chunks)}")

# Create embeddings
embeddings = model.encode(chunks)

print(f"Embeddings Shape: {embeddings.shape}")

print("\nFirst Vector:\n")
print(embeddings[0])