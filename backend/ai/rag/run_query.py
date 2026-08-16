import sys
import io
from rag_service import ask_rag

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = sys.argv[1]
        try:
            answer = ask_rag(question)
            print(answer)
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Please provide a question as an argument.")
