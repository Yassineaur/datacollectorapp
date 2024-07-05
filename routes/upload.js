const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const azure = require('azure-storage');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mongoUrl = process.env.MONGO_URL;
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_KEY);
const containerName = 'audiofiles';

router.post('/', upload.none(), async (req, res) => {
    const audioData = req.body.audioData;
    const label = req.body.label;

    if (!audioData) {
        return res.status(400).json({ message: 'Audio data is missing' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');
    const blobName = `${label}_audio_${Date.now()}.wav`;
    const metadata = { label: label };

    try {
        await new Promise((resolve, reject) => {
            blobService.createBlockBlobFromText(containerName, blobName, buffer, { metadata: metadata }, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Save metadata to MongoDB
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db('audio_data');
        const collection = db.collection('recordings');
        await collection.insertOne({ blobName, label });

        res.json({ message: 'Merci! :)' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Erreur!' });
    }
});

module.exports = router;