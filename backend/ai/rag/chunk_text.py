import fitz
import re

# Read PDF
doc = fitz.open("../knowledge/paddy.pdf")

text = ""
for page in doc:
    text += page.get_text()

# Heading-aware splitting
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

print(f"Total Chunks: {len(chunks)}")

print("\nFirst Chunk:\n")
print(chunks[0] if len(chunks) > 0 else "")

print("\nSecond Chunk:\n")
print(chunks[1] if len(chunks) > 1 else "")