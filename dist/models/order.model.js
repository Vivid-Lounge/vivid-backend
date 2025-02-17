"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const types_1 = require("../shared/types");
const orderSchema = new mongoose_1.default.Schema({
    tableNumber: { type: Number, required: true },
    products: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }],
    currentState: {
        type: String,
        enum: Object.values(types_1.OrderStates),
        required: true,
        default: types_1.OrderStates.NOT_TAKEN,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Order', orderSchema);
