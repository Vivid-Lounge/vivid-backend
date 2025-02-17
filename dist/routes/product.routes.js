"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const middlewares_1 = require("../workers/middlewares");
const setupUploadDir_1 = require("../workers/setupUploadDir");
const middlewares_2 = require("../workers/middlewares");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const uploadDir = (0, setupUploadDir_1.setupImagesDirectory)();
const storage = multer_1.default.memoryStorage(); // Use memory storage for multer
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: Infinity },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
router.get('/products', middlewares_1.authMiddleware, product_controller_1.getProducts);
router.get('/products/:id', middlewares_1.authMiddleware, product_controller_1.getProduct);
router.post('/products', upload.single('image'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Numele este obligatoriu'),
    (0, express_validator_1.body)('price')
        .isFloat({ gt: 0 })
        .withMessage('Prețul trebuie să fie pozitiv'),
], middlewares_1.authMiddleware, middlewares_2.compressImage, product_controller_1.createProduct);
router.put('/products/:id', upload.single('image'), middlewares_1.authMiddleware, middlewares_2.compressImage, product_controller_1.updateProduct);
router.delete('/products/:id', middlewares_1.authMiddleware, product_controller_1.deleteProduct);
router.put('/products/:id/toggle', middlewares_1.authMiddleware, product_controller_1.toggleProductVisibility);
exports.default = router;
