const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');  // Add this if you plan to use axios

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mongoUrl = process.env.MONGO_URL;
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'audiofiles';

router.post('/', upload.none(), async (req, res) => {
    const audioData = req.body.audioData;
    const label = req.body.label;

    if (!audioData) {
        return res.status(400).json({ message: 'Audio data is missing' });
    }

    const buffer = Buffer.from(audioData, 'base64');
    const blobName = `${label}_audio_${Date.now()}.wav`;

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: 'audio/wav' },
            metadata: { label: label }
        });

        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db('audio_data');
        const collection = db.collection('recordings');
        await collection.insertOne({ blobName, label });

        res.json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

module.exports = router;