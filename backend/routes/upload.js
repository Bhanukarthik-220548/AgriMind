const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');
const FormData = require('form-data');

// Store uploaded image in memory instead of creating uploads/ folder
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }

    try {
        // Prepare form data for FastAPI
        const formData = new FormData();

        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Call FastAPI
       const aiResponse = await axios.post(
            'https://agrimind-ai-dslc.onrender.com/predict',
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );
        // Send AI response back to React
        res.json(aiResponse.data);

    } catch (error) {

        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: 'Failed to process image with AI service.',
            error: error.response?.data || error.message,
            status: "model_error"
        });
    }
});

module.exports = router;