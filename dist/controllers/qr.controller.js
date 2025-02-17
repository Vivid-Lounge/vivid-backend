"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getQRCode = exports.deleteAllQRCodes = exports.deleteQRCode = exports.getQRCodes = exports.generateQR = void 0;
const qr_model_1 = __importDefault(require("../models/qr.model"));
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Jimp = __importStar(require("jimp"));
const qrcode_1 = __importDefault(require("qrcode"));
const order_model_1 = __importDefault(require("../models/order.model"));
const generateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { numTables } = req.body;
        numTables = parseInt(numTables, 10);
        const newQRCodes = [];
        const currQRCodes = yield qr_model_1.default.find();
        const qrCodesLength = currQRCodes.length;
        for (let i = qrCodesLength + 1; i <= qrCodesLength + numTables; i++) {
            console.log('i', i);
            let tableUrl = `http://localhost:5173/table/masa/${i}`;
            let tableNumber = i;
            const randomUUID = (0, uuid_1.v4)();
            const qrBuffer = yield qrcode_1.default.toBuffer(tableUrl, {
                width: 800,
                type: 'png',
                errorCorrectionLevel: 'H',
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            const qrImage = yield Jimp.Jimp.read(qrBuffer);
            const logoPath = path_1.default.join(__dirname, '../../public/logo/logo.png');
            const logoImage = yield Jimp.Jimp.read(logoPath);
            const qrWidth = qrImage.bitmap.width;
            const qrHeight = qrImage.bitmap.height;
            const logoWidth = qrWidth / 3.2;
            const logoHeight = qrHeight / 4;
            logoImage.resize({ w: logoWidth, h: logoHeight });
            const xPos = (qrWidth - logoWidth) / 2;
            const yPos = (qrHeight - logoHeight) / 2;
            qrImage.composite(logoImage, xPos, yPos, {
                opacitySource: 1,
                opacityDest: 1,
            });
            const finalBuffer = qrImage.getBuffer(Jimp.JimpMime.png);
            const imageUrl = `table_${tableUrl
                .split('/')
                .pop()}___${randomUUID}.png`;
            const folderPath = path_1.default.join(__dirname, '../../public/qrcodes');
            yield promises_1.default.mkdir(folderPath, { recursive: true });
            const filePath = path_1.default.join(folderPath, imageUrl);
            yield promises_1.default.writeFile(filePath, yield finalBuffer);
            const newQRCode = new qr_model_1.default({
                tableUrl,
                tableNumber,
                imageUrl: imageUrl,
            });
            newQRCodes.push(newQRCode);
            console.log('running');
        }
        yield qr_model_1.default.insertMany(newQRCodes);
        console.log(newQRCodes);
        res.status(200).json(newQRCodes);
    }
    catch (err) {
        console.log(err);
        console.error('Eroare la generarea codului QR:', err);
        res.status(500).json({ error: 'Eroare la generarea codului QR' });
    }
});
exports.generateQR = generateQR;
const getQRCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCodes = yield qr_model_1.default.find();
        res.status(200).json(qrCodes);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea codurilor QR' });
    }
});
exports.getQRCodes = getQRCodes;
const deleteQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCode = yield qr_model_1.default.findById(req.params.id);
        if (qrCode) {
            console.log(qrCode.tableUrl.split('/')[5]);
            yield order_model_1.default.deleteMany({
                tableNumber: qrCode.tableUrl.split('/')[5],
            });
            const deleted = yield qr_model_1.default.findByIdAndDelete(req.params.id);
            const filePath = path_1.default.join(__dirname, '../../public/qrcodes', qrCode.imageUrl);
            yield promises_1.default.unlink(filePath);
            res.status(200).json({ message: 'Codul QR a fost șters' });
        }
        else {
            res.status(404).json({ message: 'Codul QR nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la ștergerea codului QR' });
    }
});
exports.deleteQRCode = deleteQRCode;
const deleteAllQRCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCodes = yield qr_model_1.default.find();
        if (qrCodes.length > 0) {
            yield qr_model_1.default.deleteMany({});
            yield order_model_1.default.deleteMany({});
            const folderPath = path_1.default.join(__dirname, '../../public/qrcodes');
            const files = yield promises_1.default.readdir(folderPath);
            for (const file of files) {
                console.log(path_1.default.join(folderPath, file));
                yield promises_1.default.unlink(path_1.default.join(folderPath, file));
            }
            res.status(200).json({
                message: 'Toate codurile QR au fost șterse',
            });
        }
        else {
            res.status(404).json({ message: 'Codurile QR nu au fost găsite' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la ștergerea codurilor QR' });
    }
});
exports.deleteAllQRCodes = deleteAllQRCodes;
const getQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCode = yield qr_model_1.default.findById(req.params.id)
            .populate('orders')
            .populate({
            path: 'orders',
            populate: {
                path: 'products',
                model: 'Product',
            },
        });
        if (qrCode) {
            res.json(qrCode);
        }
        else {
            res.status(404).json({ message: 'Codul QR nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea codului QR' });
    }
});
exports.getQRCode = getQRCode;
