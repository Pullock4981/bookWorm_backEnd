const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'bookworm/others';
        let resource_type = 'auto';

        if (file.mimetype.startsWith('image')) {
            folder = 'bookworm/covers';
        } else if (file.mimetype === 'application/pdf') {
            folder = 'bookworm/books';
            resource_type = 'raw'; // PDF needs 'raw' or 'auto' depends on Cloudinary version, 'raw' is safer for non-image files
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = { cloudinary, upload };
