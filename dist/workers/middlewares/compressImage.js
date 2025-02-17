"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const compressImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file && !req.files)
        return next();
    try {
        if (req.file) {
            // Handle single file upload
            const file = req.file;
            const { buffer, originalname } = file;
            const timestamp = Date.now();
            const ref = `${timestamp}-${originalname}`;
            const compressedImage = yield (0, sharp_1.default)(buffer)
                .resize({
                width: 1000,
                height: 1000,
                fit: 'inside',
            }) // Resize to max width of 1000px (maintain aspect ratio)
                .webp({
                quality: 90,
            }) // Convert to WebP format with 90% quality
                .toBuffer();
            file.buffer = compressedImage;
            file.originalname = `${ref}.webp`;
            console.log('Image compressed', file.originalname);
        }
        else if (req.files) {
            // Handle multiple file uploads
            const files = req.files;
            for (const fieldname in files) {
                for (const file of files[fieldname]) {
                    const { buffer, originalname } = file;
                    const sanitizedOriginalName = originalname
                        .replace(/\s+/g, '_')
                        .replace(/[^a-zA-Z0-9._-]/g, '');
                    const ref = sanitizedOriginalName.replace(/\.[^/.]+$/, '');
                    const compressedImage = yield (0, sharp_1.default)(buffer)
                        .resize({
                        width: 1000,
                        height: 1000,
                        fit: 'inside',
                    }) // Resize to max width of 1000px (maintain aspect ratio)
                        .webp({
                        quality: 90,
                    }) // Convert to WebP format with 90% quality
                        .toBuffer();
                    file.buffer = compressedImage;
                    file.originalname = `${ref}.webp`;
                    console.log('Image compressed', file.originalname);
                }
            }
        }
        next();
    }
    catch (error) {
        console.error('Error compressing image:', error);
        res.status(500).json({ error: 'Error compressing image' });
    }
});
exports.compressImage = compressImage;
