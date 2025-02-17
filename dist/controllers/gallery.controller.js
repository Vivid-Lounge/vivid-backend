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
exports.updateGallery = exports.deleteImage = exports.insertImages = exports.getGallery = void 0;
const gallery_model_1 = __importDefault(require("../models/gallery.model"));
const image_model_1 = __importDefault(require("../models/image.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const getGallery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gallery = yield gallery_model_1.default.find();
        res.json(gallery);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea galeriei' });
    }
});
exports.getGallery = getGallery;
const insertImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const files = req.files;
        let gallery = yield gallery_model_1.default.findOne({});
        if (!gallery) {
            gallery = new gallery_model_1.default({ imageArray: [] });
        }
        if (!((_a = files === null || files === void 0 ? void 0 : files.images) === null || _a === void 0 ? void 0 : _a.length)) {
            return res.status(500).json({ error: 'Nu s-au primit imagini!' });
        }
        const chunkSize = 3;
        for (let i = 0; i < files.images.length; i += chunkSize) {
            const chunk = files.images.slice(i, i + chunkSize);
            yield Promise.all(chunk.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const imagePath = path_1.default.join(__dirname, `../../public/gallery/${file.originalname}`);
                    const maxRetries = 3;
                    let retries = 0;
                    while (retries < maxRetries) {
                        try {
                            yield promises_1.default.writeFile(imagePath, file.buffer);
                            break;
                        }
                        catch (writeError) {
                            retries++;
                            if (retries === maxRetries)
                                throw writeError;
                            // Wait before retrying
                            yield new Promise((resolve) => setTimeout(resolve, 1000));
                        }
                    }
                    const newImage = new image_model_1.default({
                        imageUrl: file.originalname,
                        priority: 1,
                    });
                    gallery.imageArray.push(newImage);
                }
                catch (fileError) {
                    console.error(`Error processing file ${file.originalname}:`, fileError);
                    // Continue with other files if one fails
                }
            })));
        }
        const savedGallery = yield gallery.save();
        res.json(savedGallery.toObject({ versionKey: false }));
    }
    catch (err) {
        console.error('Error in insertImages:', err);
        res.status(500).json({
            error: 'Eroare la inserarea imaginii',
            msg: err instanceof Error ? err.message : 'Unknown error',
        });
    }
});
exports.insertImages = insertImages;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageId = req.body.data.imageArray;
        const gallery = yield gallery_model_1.default.findOne({});
        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nu a fost găsită' });
        }
        imageId.forEach((element) => {
            const foundImageIndex = gallery.imageArray.findIndex((x) => x._id.toString() === element);
            const foundImage = gallery.imageArray.find((x) => x._id.toString() === element);
            if (foundImageIndex !== -1) {
                gallery.imageArray.splice(foundImageIndex, 1);
                if (fs_1.default.existsSync(path_1.default.join(__dirname, `../../public/gallery/${foundImage === null || foundImage === void 0 ? void 0 : foundImage.imageUrl}`))) {
                    fs_1.default.unlinkSync(path_1.default.join(__dirname, `../../public/gallery/${foundImage === null || foundImage === void 0 ? void 0 : foundImage.imageUrl}`));
                }
            }
        });
        yield gallery.save();
        res.json({ message: 'Imagine ștearsă din galerie' });
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la ștergerea imaginii',
            msg: err,
        });
    }
});
exports.deleteImage = deleteImage;
const updateGallery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = req.body;
        if (!order || !Array.isArray(order)) {
            return res.status(400).json({ error: 'Ordonare greșită.' });
        }
        const gallery = yield gallery_model_1.default.findOne({});
        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nu a fost găsită' });
        }
        const imageMap = new Map(gallery.imageArray.map((img) => [img._id.toString(), img]));
        const reorderedImages = order
            .map((id) => imageMap.get(id))
            .filter((img) => Boolean(img));
        const missingImages = gallery.imageArray.filter((img) => !order.includes(img._id.toString()));
        gallery.imageArray = [...reorderedImages, ...missingImages];
        gallery.imageArray = reorderedImages;
        const savedGallery = yield gallery.save();
        const actualGallery = savedGallery.toObject({ versionKey: false });
        res.json(actualGallery);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Eroare la actualizarea galeriei',
            msg: err,
        });
    }
});
exports.updateGallery = updateGallery;
