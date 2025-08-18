// import { Request, Response } from 'express';
// import AWS from 'aws-sdk';
// import multer from 'multer';
// import { v4 as uuidv4 } from 'uuid';
// import path from 'path';

// // Configure Cloudflare R2 with S3-compatible API
// const r2 = new AWS.S3({
//     endpoint: 'https://fff50cf33deaf058d417178eae241724.r2.cloudflarestorage.com',
//     accessKeyId: '076d18336af0a2651ad7921b5f40c173',
//     secretAccessKey: '2a43c9957bc5f56f31672078a0c2feffaeedf70d87b045d7c5b713e1a02c6360',
//     signatureVersion: 'v4',
//     region: 'auto',
//     s3ForcePathStyle: true
// });

// // Configure multer for file upload
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: {
//         fileSize: 100 * 1024 * 1024 // 100MB limit
//     },
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('video/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only video files are allowed'), false);
//         }
//     }
// });

// /**
//  * Upload video to R2 and return public URL
//  * This endpoint uploads a video file to Cloudflare R2 and returns the public URL
//  * The URL can then be stored in the videoUrl field when creating ads
//  */
// export const uploadToR2 = async (req: Request, res: Response) => {
//     try {
//         // Check if file is uploaded
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No video file provided'
//             });
//         }

//         const file = req.file;
//         const fileExtension = path.extname(file.originalname);
//         const fileName = `videos/${uuidv4()}${fileExtension}`;

//         // Upload parameters for R2
//         const uploadParams = {
//             Bucket: 'primewatcher', // Replace with your actual bucket name
//             Key: fileName,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//             ContentDisposition: 'inline'
//         };

//         // Upload to R2
//         await r2.upload(uploadParams).promise();

//         // Construct public URL - same format as your imageUrl
//         const publicUrl = `https://fff50cf33deaf058d417178eae241724.r2.cloudflarestorage.com/primewatcher/${fileName}`;

//         res.json({
//             success: true,
//             message: 'Video uploaded successfully',
//             publicUrl: publicUrl // This is what gets stored in videoUrl
//         });

//     } catch (error: any) {
//         console.error('R2 Upload Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to upload video to R2',
//             error: error.message
//         });
//     }
// };

// // Export the multer middleware for use in routes
// export const uploadMiddleware = upload.single('video');

// // Example of how to add this to your existing routes:
// // app.post('/api/upload-to-r2', authenticateAdmin, uploadMiddleware, uploadToR2); 