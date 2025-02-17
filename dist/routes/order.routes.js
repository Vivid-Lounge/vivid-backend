"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const express_validator_1 = require("express-validator");
const middlewares_1 = require("../workers/middlewares");
const router = (0, express_1.Router)();
router.get('/orders', middlewares_1.authMiddleware, order_controller_1.getOrders);
router.get('/orderStats', middlewares_1.authMiddleware, order_controller_1.getOrderStats);
router.get('/orders/:id', middlewares_1.authMiddleware, order_controller_1.getOrder);
router.put('/orders/honor/:id', middlewares_1.authMiddleware, order_controller_1.honorOrder);
router.put('/orders/take/:id', middlewares_1.authMiddleware, order_controller_1.takeOrder);
router.get('/ordersbytable/:tableNumber', middlewares_1.authMiddleware, order_controller_1.getOrdersByTable);
router.post('/orders', [
    (0, express_validator_1.body)('tableNumber')
        .isInt({ gt: 0 })
        .withMessage('Numărul mesei trebuie să fie un număr întreg pozitiv'),
    (0, express_validator_1.body)('products')
        .isArray({ min: 1 })
        .withMessage('Trebuie să selectați cel puțin un produs'),
], middlewares_1.authMiddleware, order_controller_1.addOrder);
exports.default = router;
