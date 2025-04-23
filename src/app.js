// src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { globalErrorHandler } = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: '*'
}));

// Routes - import routes directly here to ensure they're loaded correctly
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to User Management API change new v1.1.1 '
    });
});

// Global error handler
app.use(globalErrorHandler);

// Database connection
const DB = process.env.DB;
const port = process.env.PORT || 5000;



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));