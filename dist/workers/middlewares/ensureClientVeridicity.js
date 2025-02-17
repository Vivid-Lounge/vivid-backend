"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureClientVeridicity = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getBearerToken_1 = require("../getBearerToken");
const ensureClientVeridicity = (req, res, next) => {
    try {
        const token = (0, getBearerToken_1.getBearerToken)(req);
        console.log('token at ensure client veridicity', token);
        if (!token) {
            return res
                .status(401)
                .json({ message: 'Access denied at client token' });
        }
        console.log('token at ensure client veridicity', token);
        jsonwebtoken_1.default.verify(token, process.env.CLIENT_JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).json({
                    message: 'Access denied at jwt verify ensure client veridicity',
                    err,
                });
            }
            else {
                console.log('decoded token at ensure client veridicity', decoded);
                if (decoded.iss ===
                    process.env.CLIENT_ISSUER_URI &&
                    decoded.aud === process.env.API_URI) {
                    next();
                }
                else
                    return res.status(401).json({
                        message: 'access forbidden. owner has been contacted',
                    });
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
exports.ensureClientVeridicity = ensureClientVeridicity;
