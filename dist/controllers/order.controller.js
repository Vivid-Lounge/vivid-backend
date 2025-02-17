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
exports.handleTableOrder = exports.getOrdersByTable = exports.getOrder = exports.takeOrder = exports.honorOrder = exports.getUnhonoredOrders = exports.getOrderStats = exports.getOrders = exports.addOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const qr_model_1 = __importDefault(require("../models/qr.model"));
const types_1 = require("../shared/types");
const addOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tableNumber, products } = req.body;
        console.log(req.body);
        const productDetails = yield product_model_1.default.find({
            _id: { $in: products },
        });
        const total = productDetails.reduce((acc, product) => acc + product.price, 0);
        const newOrder = new order_model_1.default({
            tableNumber,
            products: productDetails,
            taken: false,
            honored: false,
            total,
        });
        const savedOrder = yield newOrder.save();
        yield qr_model_1.default.findOneAndUpdate({ tableNumber }, {
            $push: { orders: savedOrder },
        });
        res.status(201).json(savedOrder);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});
exports.addOrder = addOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find().populate('products');
        // orders.sort((a, b) => {
        // 	if (!a.taken && b.taken) return -1
        // 	if (a.taken && !b.taken) return 1
        // 	if (!a.honored && b.honored) return -1
        // 	if (a.honored && !b.honored) return 1
        // 	return (
        // 		new Date(a.createdAt).getTime() -
        // 		new Date(b.createdAt).getTime()
        // 	)
        // })
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea comenzilor' });
    }
});
exports.getOrders = getOrders;
const getOrderStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todaysOrders = yield order_model_1.default.find({
        // createdAt: {
        //   $gte: startOfDay(today),
        //   $lte: endOfDay(today)
        // }
        }).populate('products');
        const totalHonoredOrdersPrice = todaysOrders
            .filter((order) => order.currentState === 'Honored')
            .reduce((total, order) => {
            const orderTotal = order.products.reduce((orderSum, product) => {
                return orderSum + product.price;
            }, 0);
            return total + orderTotal;
        }, 0);
        const honoredOrdersCount = todaysOrders.filter((order) => order.currentState === 'Honored').length;
        const unhonoredOrdersCount = todaysOrders.filter((order) => order.currentState !== 'Honored' &&
            order.currentState === 'Taken').length;
        const untakenOrdersCount = todaysOrders.filter((order) => order.currentState === 'Not taken').length;
        res.json({
            unhonoredOrdersCount: unhonoredOrdersCount,
            untakenOrdersCount: untakenOrdersCount,
            honoredOrdersCount: honoredOrdersCount,
            totalPrice: totalHonoredOrdersPrice,
        });
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la obținerea informatiilor despre comenzile existente!',
        });
    }
});
exports.getOrderStats = getOrderStats;
const getUnhonoredOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find({ honored: false }).populate('products');
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea comenzilor' });
    }
});
exports.getUnhonoredOrders = getUnhonoredOrders;
const honorOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const updatedOrder = yield order_model_1.default.findByIdAndUpdate(orderId, {
            currentState: types_1.OrderStates.HONORED,
        }, {
            new: true,
        }).populate('products');
        if (updatedOrder) {
            res.json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Comanda nu a fost găsită' });
        }
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la actualizarea comenzii',
            stack: err,
        });
    }
});
exports.honorOrder = honorOrder;
const takeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        console.log('beforeUpdate', yield order_model_1.default.findById(orderId));
        const updatedOrder = yield order_model_1.default.findByIdAndUpdate(orderId, {
            currentState: types_1.OrderStates.TAKEN,
        }, {
            new: true,
        }).populate('products');
        console.log('updatedOrder', updatedOrder);
        if (updatedOrder) {
            res.json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Comanda nu a fost găsită' });
        }
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la actualizarea comenzii',
            stack: err,
        });
    }
});
exports.takeOrder = takeOrder;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id).populate('products');
        if (order) {
            res.json(order);
        }
        else {
            res.status(404).json({ message: 'Comanda nu a fost găsită' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea comenzii' });
    }
});
exports.getOrder = getOrder;
const getOrdersByTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find({
            tableNumber: req.params.tableNumber,
        }).populate('products');
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la obținerea comenzilor' });
    }
});
exports.getOrdersByTable = getOrdersByTable;
const handleTableOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({ error: 'Eroare la actualizarea comenzii' });
    }
});
exports.handleTableOrder = handleTableOrder;
