// Imports
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI // Load from env

// Configure the connection
const ConnectDb = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connection MongoDB established.')
    } catch (error) {
        console.error('Error while connecting to mongodb.', error.message);
        process.exit(1);
    }
}

// Export
module.exports = ConnectDb;