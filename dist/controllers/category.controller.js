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
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.updateCategories = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const updateCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submittedCategories = req.body.categories;
        console.log(submittedCategories, 'submittedCategories');
        // 1) Fetch existing categories
        const existingCategories = yield category_model_1.default.find().lean();
        // 2) Classify into update / add / unchanged / delete
        const categoriesToUpdate = [];
        const categoriesToAdd = [];
        const categoriesToLeaveUnchanged = [];
        const categoriesToDelete = [];
        // Figure out updates vs. new vs. unchanged
        submittedCategories.forEach((submittedCat) => {
            const existingCat = existingCategories.find((ex) => ex._id.toString() === submittedCat._id);
            if (existingCat) {
                const parentIdAsString = existingCat.parent
                    ? existingCat.parent.toString()
                    : null;
                if (existingCat.name !== submittedCat.name ||
                    parentIdAsString !== submittedCat.parent) {
                    categoriesToUpdate.push(submittedCat);
                }
                else {
                    categoriesToLeaveUnchanged.push(submittedCat);
                }
            }
            else {
                categoriesToAdd.push(submittedCat);
            }
        });
        // Figure out which existing ones to delete
        existingCategories.forEach((ex) => {
            const stillExists = submittedCategories.find((sub) => sub._id === ex._id.toString());
            if (!stillExists) {
                categoriesToDelete.push(ex._id.toString());
            }
        });
        console.log({
            categoriesToUpdate,
            categoriesToAdd,
            categoriesToLeaveUnchanged,
            categoriesToDelete,
        });
        // 3) Update changed categories
        const updatePromises = categoriesToUpdate.map((cat) => category_model_1.default.findByIdAndUpdate(cat._id, {
            name: cat.name,
            parent: cat.parent,
        }));
        // 4) Create new categories (two-level approach)
        const creationPromises = [];
        if (categoriesToAdd.length > 0) {
            // A) Top-level new categories
            const topLevel = categoriesToAdd.filter((cat) => cat.parent === null);
            const children = categoriesToAdd.filter((cat) => cat.parent !== null);
            // B) Create top-level
            const createdParentDocs = yield Promise.all(topLevel.map((cat) => category_model_1.default.create({
                name: cat.name,
                parent: null,
            })));
            // C) Map local ID → real ID
            const localIdMap = {};
            topLevel.forEach((cat, idx) => {
                localIdMap[cat._id] = createdParentDocs[idx]._id.toString();
            });
            // D) Create children
            for (const cat of children) {
                let parentId = null;
                if (cat.parent &&
                    mongoose_1.default.Types.ObjectId.isValid(cat.parent.toString())) {
                    // references an existing category
                    const parentString = cat.parent.toString();
                    parentId = parentString || null;
                }
                else if (cat.parent && localIdMap[cat.parent.toString()]) {
                    // references a newly created parent
                    parentId = localIdMap[cat.parent.toString()];
                }
                creationPromises.push(category_model_1.default.create({
                    name: cat.name,
                    parent: parentId,
                }));
            }
        }
        // 5) Delete removed categories
        const deletePromises = categoriesToDelete.map((id) => category_model_1.default.findByIdAndDelete(id));
        // 6) Await everything
        yield Promise.all([
            ...updatePromises,
            ...creationPromises,
            ...deletePromises,
        ]);
        // 7) Fetch updated list
        const updatedCategories = yield category_model_1.default.find().lean();
        res.status(200).json(updatedCategories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error updating categories',
            stack: error,
        });
    }
});
exports.updateCategories = updateCategories;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find();
        const actualCategories = categories.map((category) => category.toObject({ versionKey: false }));
        res.json(actualCategories);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea categoriilor' });
    }
});
exports.getCategories = getCategories;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('getCategorydwwwwwwwwwwwww', req.params.id);
        const category = yield category_model_1.default.findById(req.params.id);
        let products;
        if (category && category.parent === null) {
            products = yield product_model_1.default
                .find({ parentCategory: category._id })
                .select('-__v')
                .populate('parentCategory')
                .populate('childCategory');
        }
        else if (category && category.parent !== null) {
            products = yield product_model_1.default
                .find({ childCategory: category._id })
                .select('-__v')
                .populate('parentCategory')
                .populate('childCategory');
        }
        console.log('products', products);
        if (category && products) {
            res.status(200).json(products);
        }
        else {
            res.status(404).json({ message: 'Categoria nu a fost găsită' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea categoriei' });
    }
});
exports.getCategory = getCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const category = yield category_model_1.default.findOneAndUpdate({ name }, { name }, { new: true });
        if (!category) {
            return res.status(404).json({ error: 'Categoria nu a fost gasit.' });
        }
        res.status(200).json(category);
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la actualizarea categoriei',
            err,
        });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield category_model_1.default.findByIdAndDelete(req.params.id);
        if (category) {
            res.status(200).json(category);
        }
        else {
            res.status(404).json({ message: 'Categoria nu a fost găsită' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la ștergerea categoriei' });
    }
});
exports.deleteCategory = deleteCategory;
