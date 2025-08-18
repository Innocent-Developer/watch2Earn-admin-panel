// Backend implementation for Cloudflare R2 video upload
// This file shows how to implement the /admin/upload-video endpoint

const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure Cloudflare R2 with S3-compatible API
const r2 = new AWS.S3({
    endpoint: 'https://fff50cf33deaf058d417178eae241724.r2.cloudflarestorage.com',
    accessKeyId: '076d18336af0a2651ad7921b5f40c173',
    secretAccessKey: '2a43c9957bc5f56f31672078a0c2feffaeedf70d87b045d7c5b713e1a02c6360',
    signatureVersion: 'v4',
    region: 'auto', // R2 uses 'auto' as region
    s3ForcePathStyle: true // Required for R2
});

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});

/**
 * Upload video to Cloudflare R2 storage
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
async function uploadVideoToR2(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file provided'
            });
        }

        const file = req.file;
        const fileExtension = path.extname(file.originalname);
        const fileName = `videos/${uuidv4()}${fileExtension}`;

        // Upload parameters for R2
        const uploadParams = {
            Bucket: 'primewatcher', // Replace with your actual bucket name
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: 'inline', // Allow direct viewing in browser
            // Make the file publicly accessible
            ACL: 'public-read'
        };

        // Upload to R2
        const uploadResult = await r2.upload(uploadParams).promise();

        // Construct public URL
        const publicUrl = `https://fff50cf33deaf058d417178eae241724.r2.cloudflarestorage.com/primewatcher/${fileName}`;

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                videoUrl: publicUrl,
                fileName: fileName,
                fileSize: file.size,
                contentType: file.mimetype
            }
        });

    } catch (error) {
        console.error('R2 Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload video',
            error: error.message
        });
    }
}

/**
 * Express route setup
 * Add this to your main Express app
 */
function setupR2Routes(app) {
    // Middleware to verify admin token
    const verifyAdminToken = (req, res, next) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided'
            });
        }

        // Verify the admin token here
        // This should match your existing auth logic
        // For example:
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // if (!decoded.isAdmin) throw new Error('Not authorized');

        next();
    };

    // Video upload endpoint
    app.post('/api/admin/upload-video',
        verifyAdminToken,
        upload.single('video'),
        uploadVideoToR2
    );
}

/**
 * Alternative implementation using custom domain
 * If you set up a custom domain for your R2 bucket
 */
function getPublicUrlWithCustomDomain(fileName) {
    // Replace with your custom domain if configured
    return `https://your-custom-domain.com/${fileName}`;
}

/**
 * Delete video from R2 (for cleanup)
 * @param {string} fileName - The file name/key in R2
 */
async function deleteVideoFromR2(fileName) {
    try {
        const deleteParams = {
            Bucket: 'primewatcher',
            Key: fileName
        };

        await r2.deleteObject(deleteParams).promise();
        return true;
    } catch (error) {
        console.error('Failed to delete video from R2:', error);
        return false;
    }
}

module.exports = {
    uploadVideoToR2,
    setupR2Routes,
    deleteVideoFromR2
};

// Usage example in your main app:
/*
const express = require('express');
const { setupR2Routes } = require('./r2-upload-backend');

const app = express();

// Setup R2 routes
setupR2Routes(app);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
*/ 