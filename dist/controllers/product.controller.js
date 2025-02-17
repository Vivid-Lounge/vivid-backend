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
exports.toggleProductVisibility = exports.deleteAllProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const category_model_1 = __importDefault(require("../models/category.model"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_model_1.default.find()
            .select('-__v')
            .populate('parentCategory')
            .populate('childCategory');
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea produselor' });
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.default.findById(req.params.id);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: 'Produsul nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea produsului' });
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, quantityInGrams, parentId, childId } = req.body;
        console.log(req.body);
        const file = req.file;
        const parentCategoryDoc = yield category_model_1.default.findById(parentId);
        const childCategoryDoc = childId
            ? yield category_model_1.default.findById(childId)
            : null;
        console.log('parentCategoryDoc', parentCategoryDoc);
        console.log('childCategoryDoc', childCategoryDoc);
        const processedImagePath = path_1.default.join(__dirname, `../../public/images/${file.originalname}`);
        yield promises_1.default.writeFile(processedImagePath, file.buffer);
        const imageUrl = `/images/${file.originalname}`;
        const newProduct = new product_model_1.default({
            name,
            description,
            price,
            quantityInGrams,
            parentCategory: parentCategoryDoc ? parentCategoryDoc._id : null,
            childCategory: childCategoryDoc ? childCategoryDoc._id : null,
            imageUrl,
        });
        const savedProduct = yield newProduct.save();
        const actualProduct = savedProduct.toObject({ versionKey: false });
        res.status(200).json(actualProduct);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Eroare la crearea produsului', err });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, quantityInGrams, parentId, childId } = req.body;
        const file = req.file;
        const product = yield product_model_1.default.findById(req.params.id);
        const parentCategoryDoc = yield category_model_1.default.findById(parentId);
        const childCategoryDoc = yield category_model_1.default.findById(childId);
        let imageUrl = product === null || product === void 0 ? void 0 : product.imageUrl;
        if (file) {
            const processedImagePath = path_1.default.join(__dirname, `../../public/images/${file.originalname}`);
            yield promises_1.default.writeFile(processedImagePath, file.buffer);
            imageUrl = `/images/${file.originalname}`;
        }
        const updatedProduct = yield product_model_1.default.findByIdAndUpdate(req.params.id, {
            name,
            description,
            price,
            quantityInGrams,
            parentCategory: parentCategoryDoc
                ? parentCategoryDoc._id
                : null,
            childCategory: childCategoryDoc ? childCategoryDoc._id : null,
            imageUrl,
        }, { new: true })
            .select('-__v')
            .populate('parentCategory')
            .populate('childCategory');
        if (updatedProduct) {
            res.json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Produsul nu a fost găsit' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Eroare la actualizarea produsului',
            err: err,
        });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let imageUrl = (yield product_model_1.default.findById(req.params.id))
            .imageUrl;
        if (!imageUrl) {
            return res.status(404).json({ message: 'Produsul nu a fost găsit' });
        }
        const deletedProduct = yield product_model_1.default.findByIdAndDelete(req.params.id);
        yield promises_1.default.unlink(path_1.default.join(__dirname, `../../public/${imageUrl}`));
        if (deletedProduct) {
            res.status(200).json({ message: 'Produs șters cu succes' });
        }
        else {
            res.status(404).json({ message: 'Produsul nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la ștergerea produsului',
            msg: err,
        });
    }
});
exports.deleteProduct = deleteProduct;
const deleteAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_model_1.default.find();
        if (products.length > 0) {
            // Delete all products from the database
            yield product_model_1.default.deleteMany({});
            // Delete all files from the /public/images directory
            const folderPath = path_1.default.join(__dirname, '../../public/images');
            const files = yield promises_1.default.readdir(folderPath);
            for (const file of files) {
                yield promises_1.default.unlink(path_1.default.join(folderPath, file));
            }
            res.status(200).json({
                message: 'Toate produsele au fost șterse',
            });
        }
        else {
            res.status(404).json({ message: 'Produsele nu au fost găsite' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la ștergerea produselor' });
    }
});
exports.deleteAllProducts = deleteAllProducts;
const toggleProductVisibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.default.findById(req.params.id);
        if (product) {
            const updatedProduct = yield product_model_1.default.findByIdAndUpdate(req.params.id, { isVisible: !product.isVisible }, { new: true })
                .select('-__v')
                .populate('parentCategory')
                .populate('childCategory');
            res.status(200).json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Produsul nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la actualizarea produsului',
            err: err,
        });
    }
});
exports.toggleProductVisibility = toggleProductVisibility;
