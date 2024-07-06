require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const uploadRoute = require('./routes/upload');

const app = express();
const port = process.env.PORT || 3000;

// Increase the limit for request body size
app.use(bodyParser.json({ limit: '800kb' }));
app.use(bodyParser.urlencoded({ limit: '800kb', extended: true }));

app.use(express.static('public'));
app.use('/upload', uploadRoute);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


