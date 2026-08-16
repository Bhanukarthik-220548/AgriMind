const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        // Prepare form data for FastAPI
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        // Call FastAPI Python service
        const aiResponse = await axios.post('http://localhost:8000/predict', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Delete the file after processing to save space (optional but recommended)
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete local file:", err);
        });

        // Send AI response back to React frontend
        res.json(aiResponse.data);

    } catch (error) {
        console.error("AI Service Error:", error.message);
        
        // Clean up file if it fails
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }

        res.status(500).json({ 
            message: 'Failed to process image with AI service.',
            error: error.response?.data || error.message,
            status: "model_error"
        });
    }
});

module.exports = router;
