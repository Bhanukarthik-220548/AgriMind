const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const authMiddleware = require('../middleware/auth');

router.post('/ask', authMiddleware, (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    const scriptPath = path.join(__dirname, '../ai/rag/run_query.py');
    const cwd = path.join(__dirname, '../ai/rag'); // Execute in the rag dir so chroma_db path works
    
    // Check if ai-service/venv/Scripts/python.exe exists (Windows), use it if it does
    const venvPythonPath = path.join(__dirname, '../../../ai-service/venv/Scripts/python.exe');
    const fs = require('fs');
    const pythonExecutable = fs.existsSync(venvPythonPath) ? venvPythonPath : 'python';
    
    const pythonProcess = spawn(pythonExecutable, [scriptPath, question], { 
        cwd,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    
    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('Python script error:', errorOutput);
            return res.status(500).json({ message: 'Error answering question', error: errorOutput });
        }
        res.json({ answer: result.trim() });
    });
});

module.exports = router;
