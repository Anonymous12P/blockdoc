const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Blockchain Document Storage Backend Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

module.exports = app;