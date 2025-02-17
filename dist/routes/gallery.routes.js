"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gallery_controller_1 = require("../controllers/gallery.controller");
const setupUploadDir_1 = require("../workers/setupUploadDir");
const multer_1 = __importDefault(require("multer"));
const middlewares_1 = require("../workers/middlewares");
const middlewares_2 = require("../workers/middlewares");
const uploadDir = (0, setupUploadDir_1.setupGalleryDirectory)();
const storage = multer_1.default.memoryStorage(); // Use memory storage for multer
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: Infinity },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'images') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
const router = (0, express_1.Router)();
router.get('/gallery', gallery_controller_1.getGallery);
router.post('/gallery', middlewares_1.authMiddleware, upload.fields([
    {
        name: 'images',
        maxCount: 32,
    },
]), middlewares_2.compressImage, gallery_controller_1.insertImages);
router.put('/gallery', middlewares_1.authMiddleware, gallery_controller_1.updateGallery);
router.put('/deleteImage', middlewares_1.authMiddleware, gallery_controller_1.deleteImage);
exports.default = router;
