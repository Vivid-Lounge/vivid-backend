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
exports.retrieveMe = exports.alterAccount = exports.getAccounts = exports.deleteAccount = exports.logout = exports.loginAccount = exports.createAccount = void 0;
const auth_model_1 = __importDefault(require("../models/auth.model"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, accountUsername, accountPassword, accountConfirmPassword, role, } = req.body;
        console.log(req.body);
        const foundAccount = yield auth_model_1.default.find({
            accountUsername: { $in: accountUsername },
        });
        if (foundAccount.length > 0) {
            res.status(422).json({ error: 'Contul deja exista!' });
            return;
        }
        if (accountPassword != accountConfirmPassword) {
            res.status(403).json({ error: 'Parolele nu coincid!' });
            return;
        }
        const hashedPassword = crypto_1.default
            .createHash('sha512')
            .update(accountPassword)
            .digest('hex');
        const newAccount = new auth_model_1.default({
            firstName,
            lastName,
            accountUsername,
            accountPassword: hashedPassword,
            role,
        });
        const savedAccount = yield newAccount.save();
        console.log('savedAccount', savedAccount);
        const accountResponse = savedAccount.toObject({
            versionKey: false,
        });
        if (accountResponse && accountResponse.accountPassword) {
            delete accountResponse.accountPassword;
        }
        res.status(200).json(accountResponse);
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});
exports.createAccount = createAccount;
const loginAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { accountUsername, accountPassword } = req.body.credentials;
        const foundAccount = yield auth_model_1.default.findOne({
            accountUsername,
        });
        if (foundAccount == null) {
            res.status(403).json('Cont sau parola incorecta!');
            return;
        }
        const hashedPassword = crypto_1.default
            .createHash('sha512')
            .update(accountPassword)
            .digest('hex');
        if (foundAccount.accountPassword != hashedPassword) {
            res.status(403).json({ message: 'Cont sau parola incorecta!' });
            return;
        }
        const tokenSecret = process.env.BACKEND_JWT_SECRET;
        if (!tokenSecret) {
            res.status(500).json({ error: 'JWT_SECRET is not defined' });
            return;
        }
        const accountPrivilage = foundAccount.role;
        jsonwebtoken_1.default.sign({
            _id: foundAccount._id,
            accountUsername: accountUsername,
            role: foundAccount.role,
        }, tokenSecret, {
            expiresIn: '24h',
            issuer: process.env.API_URI,
            audience: process.env.CLIENT_ISSUER_URI,
        }, (err, token) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            yield auth_model_1.default.findByIdAndUpdate(foundAccount._id, {
                isOnline: true,
            });
            return res.cookie('token', token).status(200).json({
                username: accountUsername,
                role: accountPrivilage,
                token: token,
            });
        }));
    }
    catch (err) {
        console.error('Error during JWT signing:', err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.loginAccount = loginAccount;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user === null || user === void 0 ? void 0 : user._id) {
            yield auth_model_1.default.findByIdAndUpdate(user._id, {
                isOnline: false,
            });
            return res.status(200).json({ message: 'Logged out' });
        }
        else {
            throw new Error('User not found');
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.logout = logout;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res
                .status(405)
                .json('Nu ai fost autentificat sau nu ai permisiune necesare!');
        }
        const { accountUsername } = req.body;
        console.log('accountUsername', req.body);
        if (!accountUsername) {
            return res
                .status(400)
                .json({ error: 'Nu exista un username specificat.' });
        }
        const deletedAccount = yield auth_model_1.default.findOneAndDelete({
            accountUsername: accountUsername,
        });
        if (!deletedAccount) {
            return res.status(404).json({ error: 'Contul nu a fost gasit.' });
        }
        res.status(200).json({ message: 'Contul a fost sters cu succes.' });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.deleteAccount = deleteAccount;
const getAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user) {
            const accounts = (yield auth_model_1.default.find()).filter((account) => { var _a; return account._id != ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id); });
            res.status(200).json(accounts);
        }
        else {
            throw new Error('User not found');
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.getAccounts = getAccounts;
const alterAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName, accountUsername, accountPassword, role } = req.body;
        const updatedAccount = yield auth_model_1.default.findByIdAndUpdate(id, {
            firstName,
            lastName,
            accountUsername,
            accountPassword,
            role,
        }, { new: true });
        if (!updatedAccount) {
            return res.status(404).json({ error: 'Contul nu a fost gasit.' });
        }
        res.status(200).json(updatedAccount);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.alterAccount = alterAccount;
const retrieveMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const userDoc = yield auth_model_1.default.findById(user === null || user === void 0 ? void 0 : user._id)
            .select('-accountPassword')
            .select('-__v');
        console.log('user', user);
        if (user === null || user === void 0 ? void 0 : user._id) {
            return res.status(200).json(userDoc);
        }
        else {
            throw new Error('User not found');
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
});
exports.retrieveMe = retrieveMe;
