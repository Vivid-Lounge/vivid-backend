"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupImagesDirectory = exports.setupGalleryDirectory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const setupGalleryDirectory = () => {
    const uploadDir = path_1.default.join(process.cwd(), 'public', 'gallery');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};
exports.setupGalleryDirectory = setupGalleryDirectory;
const setupImagesDirectory = () => {
    const uploadDir = path_1.default.join(process.cwd(), 'public', 'images');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};
exports.setupImagesDirectory = setupImagesDirectory;
