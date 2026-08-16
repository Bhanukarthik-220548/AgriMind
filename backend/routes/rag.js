const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

router.post('/ask', authMiddleware, async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    try {
        const aiResponse = await axios.post('https://agrimind-ai-dslc.onrender.com/rag/ask', {
            question: question
        });
        
        res.json(aiResponse.data);
    } catch (error) {
        console.error('FastAPI RAG Error:', error.response?.data || error.message);
        res.status(500).json({ 
            message: 'Error answering question', 
            error: error.response?.data || error.message 
        });
    }
});

module.exports = router;
