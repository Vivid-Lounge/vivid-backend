"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtVerify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtVerify = (token) => {
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                throw new Error('Invalid token');
            }
            else {
                return decoded;
            }
        });
    }
    catch (err) {
        return null;
    }
};
exports.jwtVerify = jwtVerify;
