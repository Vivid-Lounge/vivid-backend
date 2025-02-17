"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.default)();
router.get('/categories', category_controller_1.getCategories);
router.get('/categories/:id', category_controller_1.getCategory);
router.post('/categories', category_controller_1.updateCategories);
router.put('/categories/:id', category_controller_1.updateCategory);
router.delete('/categories/:id', category_controller_1.deleteCategory);
exports.default = router;
