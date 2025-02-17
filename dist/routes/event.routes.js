"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_controller_1 = require("../controllers/event.controller");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const setupUploadDir_1 = require("../workers/setupUploadDir");
const middlewares_1 = require("../workers/middlewares");
const uploadDir = (0, setupUploadDir_1.setupImagesDirectory)();
const storage = multer_1.default.memoryStorage(); // Use memory storage for multer
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: Infinity },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'posterImage' ||
            file.fieldname === 'coverImage') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
const router = (0, express_1.Router)();
router.get('/events', event_controller_1.getEvents);
router.get('/events/:slug', event_controller_1.getEvent);
router.patch('/events', event_controller_1.deleteEvents);
router.post('/events', upload.fields([
    { name: 'posterImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
]), middlewares_1.compressImage, event_controller_1.createEvent);
router.put('/events/:id', upload.fields([
    { name: 'posterImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
]), middlewares_1.compressImage, event_controller_1.updateEvent);
exports.default = router;
