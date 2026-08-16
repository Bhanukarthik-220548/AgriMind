
# AgriMind AI v1

An intelligent agricultural platform combining ML predictions and RAG to provide crop insights.

## Structure

- **/backend**: Node.js/Express server. Handles user authentication, database operations (MongoDB), and proxies AI requests.
- **/ai-service**: Python/FastAPI service. Hosts the TensorFlow ML models and the ChromaDB-powered RAG pipeline for generating intelligent agricultural insights.
- **/frontend**: React application (styled with Tailwind CSS). Provides the user interface for authenticating, uploading data, and viewing results.

## How to Start the Services

To run the full application locally, you need to start all three services in separate terminal windows.

### 1. Frontend
The frontend is a Vite-based React application.

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
The backend is a Node.js Express server.

```bash
cd backend
npm install
# Make sure to set up your .env file
npm start
```

### 3. AI Service
The AI Service is a Python FastAPI application.

```bash
cd ai-service

# Create and activate a virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate # On Windows
# source venv/bin/activate # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```
