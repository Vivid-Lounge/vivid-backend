"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_validator_1 = require("express-validator");
const middlewares_1 = require("../workers/middlewares");
const router = (0, express_1.Router)();
router.get('/accounts', middlewares_1.authMiddleware, middlewares_1.isAdminMiddleware, auth_controller_1.getAccounts);
// router.post('/login', loginAccount);
router.post('/login', middlewares_1.ensureClientVeridicity, auth_controller_1.loginAccount);
router.get('/logout', middlewares_1.authMiddleware, auth_controller_1.logout);
router.delete('/deleteAccount', [(0, express_validator_1.body)('accountUsername')], middlewares_1.authMiddleware, middlewares_1.isAdminMiddleware, auth_controller_1.deleteAccount);
router.put('/account/:id', middlewares_1.authMiddleware, middlewares_1.isAdminMiddleware, auth_controller_1.alterAccount);
router.get('/retrieve-me', middlewares_1.authMiddleware, auth_controller_1.retrieveMe);
router.post('/createaccount', [
    (0, express_validator_1.body)('firstName'),
    (0, express_validator_1.body)('lastName'),
    (0, express_validator_1.body)('accountUsername'),
    (0, express_validator_1.body)('accountPassword'),
    (0, express_validator_1.body)('role')
        .isInt({ gt: 0 })
        .withMessage('Permisiunile acordate utilizatorului sunt invalide!'),
], middlewares_1.ensureClientVeridicity, middlewares_1.authMiddleware, auth_controller_1.createAccount);
exports.default = router;
