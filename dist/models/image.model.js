"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageScheme = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.imageScheme = new mongoose_1.default.Schema({
    imageUrl: { type: String, required: true },
    priority: { type: Number, default: 0 },
});
exports.default = mongoose_1.default.model('Image', exports.imageScheme);
