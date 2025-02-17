"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const qrSchema = new mongoose_1.default.Schema({
    tableUrl: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    orders: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Order' }],
    imageUrl: { type: String },
});
exports.default = mongoose_1.default.model('QR', qrSchema);
