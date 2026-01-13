const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tutorial = require('./src/models/Tutorial');

dotenv.config();

const tutorialsData = [
    {
        title: "Getting Started with BookWorm",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "A comprehensive guide for new users to navigate the platform.",
        thumbnailUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500",
        duration: "5:30"
    },
    {
        title: "Managing Your Digital Shelves",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Learn how to organzie your books into Want to Read, Reading, and Finished shelves.",
        thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
        duration: "3:45"
    },
    {
        title: "Connecting with the Community",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Explore the social features of BookWorm and follow your favorite readers.",
        thumbnailUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500",
        duration: "4:20"
    }
];

const seedTutorials = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for tutorial seeding...');

        // Clear existing tutorials
        await Tutorial.deleteMany();
        console.log('Cleared existing tutorials.');

        // Insert new tutorials
        await Tutorial.insertMany(tutorialsData);
        console.log('Tutorials seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Seeding tutorials failed:', error);
        process.exit(1);
    }
};

seedTutorials();
