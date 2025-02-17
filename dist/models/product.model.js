"use strict";
// În src/models/product.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantityInGrams: Number,
    parentCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    childCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    isVisible: { type: Boolean, default: true },
    imageUrl: String,
});
exports.default = mongoose_1.default.model('Product', productSchema);
