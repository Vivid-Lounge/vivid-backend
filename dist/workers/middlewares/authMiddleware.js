"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getBearerToken_1 = require("../getBearerToken");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, getBearerToken_1.getBearerToken)(req);
    if (!token) {
        console.log('!token');
        return res
            .status(401)
            .json({ message: 'Access denied at !token authmiddlww' });
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.BACKEND_JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).json({
                    message: 'Access denied at jwt verify authmiddlw',
                });
            }
            req.user = decoded;
            if ((decoded.iss =
                process.env.API_URI &&
                    decoded.aud === process.env.CLIENT_ISSUER_URI)) {
                console.log('access granted');
                next();
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});
exports.authMiddleware = authMiddleware;
