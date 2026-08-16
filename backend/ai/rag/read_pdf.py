# pyrefly: ignore [missing-import]
import fitz

pdf_path="../knowledge/paddy.pdf"  

doc=fitz.open(pdf_path)

print("=" * 50)
print(f"Pages : {len(doc)}")
print("=" * 50)

text=""

for page in doc:
    text+=page.get_text()

print(text[:3000])