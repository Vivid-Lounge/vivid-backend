"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const types_1 = require("../shared/types");
const helpers_1 = require("../shared/helpers/");
const rolesByNumber = (0, helpers_1.getNumericEnumValues)(types_1.UserRoles);
const accountSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    accountUsername: { type: String, required: true },
    accountPassword: { type: String, required: true },
    role: {
        type: Number,
        required: true,
        enum: rolesByNumber,
        default: types_1.UserRoles.ADMIN,
    },
    isOnline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('Account', accountSchema);
