import fitz

doc = fitz.open("../knowledge/paddy.pdf")

text = ""

for page in doc:
    text += page.get_text()

doc.close()

import re

lines = text.split("\n")
lines = text.split("\n")

for i, line in enumerate(lines[:400]):
    print(i, repr(line))
# chunks = []
# current_chunk = ""

# for line in lines:

#     if re.match(r"^\d+\.\d+", line):

#         if current_chunk:
#             chunks.append(current_chunk.strip())

#         current_chunk = line + "\n"

#     else:
#         current_chunk += line + "\n"

# if current_chunk:
#     chunks.append(current_chunk.strip())

# print("Total Chunks:", len(chunks))

# for i, chunk in enumerate(chunks[:3]):
#     print(f"\nChunk {i+1}\n")
#     print(chunk)
#     print("-" * 60)