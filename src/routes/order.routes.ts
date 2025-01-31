import { Router } from 'express'
import {
	addOrder,
	getOrders,
	honorOrder,
	getOrder,
	takeOrder,
	getOrderStats,
	getOrdersByTable,
} from '../controllers/order.controller'
import { body } from 'express-validator'
import { authMiddleware, isAdminMiddleware } from '../workers/middlewares'
const router = Router()

router.get('/orders', authMiddleware, getOrders)
router.get('/orderStats', authMiddleware, getOrderStats)
router.get('/orders/:id', authMiddleware, getOrder)
router.put('/orders/honor/:id', authMiddleware, honorOrder)
router.put('/orders/take/:id', authMiddleware, takeOrder)
router.get('/ordersbytable/:tableNumber', authMiddleware, getOrdersByTable)

router.post(
	'/orders',
	[
		body('tableNumber')
			.isInt({ gt: 0 })
			.withMessage(
				'Numărul mesei trebuie să fie un număr întreg pozitiv'
			),
		body('products')
			.isArray({ min: 1 })
			.withMessage('Trebuie să selectați cel puțin un produs'),
	],
	authMiddleware,
	addOrder
)

export default router
