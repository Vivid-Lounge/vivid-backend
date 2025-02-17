"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TableSchema = new mongoose_1.default.Schema({
    number: { type: Number, required: true },
    qrCode: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'QR',
    },
    orders: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Order' }],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Table', TableSchema);
