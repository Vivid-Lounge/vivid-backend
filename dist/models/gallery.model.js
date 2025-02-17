"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const image_model_1 = require("./image.model");
const gallerySchema = new mongoose_1.default.Schema({
    imageArray: {
        type: [image_model_1.imageScheme],
        default: [],
        required: true,
    },
});
exports.default = mongoose_1.default.model('Gallery', gallerySchema);
