const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Register models in correct order
require('./src/models/Genre');
const Book = require('./src/models/Book');

dotenv.config();

const verifyPdfStorage = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI);
        console.log('Connected to Database');

        const latestBook = await Book.findOne().sort({ updatedAt: -1 });

        if (latestBook) {
            console.log('--- Latest Book Updated ---');
            console.log(`Title: ${latestBook.title}`);
            console.log(`PDF URL: ${latestBook.pdfUrl || 'NO PDF URL FOUND'}`);

            if (latestBook.pdfUrl && latestBook.pdfUrl.includes('cloudinary')) {
                console.log('✅ VERIFIED: PDF is stored in Cloudinary!');
            } else {
                console.log('❌ CHECK FAILED: PDF URL might be missing or not from Cloudinary.');
            }
        } else {
            console.log('No books found in database.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit();
    }
};

verifyPdfStorage();
