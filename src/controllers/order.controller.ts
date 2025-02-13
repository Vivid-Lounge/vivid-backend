import { Response } from 'express'
import OrderModel from '../models/order.model'
import ProductModel from '../models/product.model'
import { Product } from '../shared/types'
import QRModel from '../models/qr.model'
import { IRequest } from 'types'
import { OrderStates } from '../shared/types'
export const addOrder = async (req: IRequest, res: Response) => {
	try {
		const { tableNumber, products } = req.body
		console.log(req.body)
		const productDetails = await ProductModel.find({
			_id: { $in: products },
		})

		const total = productDetails.reduce(
			(acc, product) => acc + product.price,
			0
		)

		const newOrder = new OrderModel({
			tableNumber,
			products: productDetails,
			taken: false,
			honored: false,
			total,
		})
		const savedOrder = await newOrder.save()

		await QRModel.findOneAndUpdate(
			{ tableNumber },
			{
				$push: { orders: savedOrder },
			}
		)

		res.status(201).json(savedOrder)
	} catch (err) {
		console.log(err)
		res.status(500).json({ error: err })
	}
}

export const getOrders = async (req: IRequest, res: Response) => {
	try {
		const orders = await OrderModel.find().populate('products')

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

		res.json(orders)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea comenzilor' })
	}
}

export const getOrderStats = async (req: IRequest, res: Response) => {
	try {
		const todaysOrders = await OrderModel.find({
			// createdAt: {
			//   $gte: startOfDay(today),
			//   $lte: endOfDay(today)
			// }
		}).populate('products')

		const totalHonoredOrdersPrice = todaysOrders
			.filter((order) => order.currentState === 'Honored')
			.reduce((total, order) => {
				const orderTotal = order.products.reduce(
					(orderSum, product) => {
						return orderSum + (product as Product).price
					},
					0
				)
				return total + orderTotal
			}, 0)

		const honoredOrdersCount = todaysOrders.filter(
			(order) => order.currentState === 'Honored'
		).length

		const unhonoredOrdersCount = todaysOrders.filter(
			(order) =>
				order.currentState !== 'Honored' &&
				order.currentState === 'Taken'
		).length

		const untakenOrdersCount = todaysOrders.filter(
			(order) => order.currentState === 'Not taken'
		).length

		res.json({
			unhonoredOrdersCount: unhonoredOrdersCount,
			untakenOrdersCount: untakenOrdersCount,
			honoredOrdersCount: honoredOrdersCount,
			totalPrice: totalHonoredOrdersPrice,
		})
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la obținerea informatiilor despre comenzile existente!',
		})
	}
}

export const getUnhonoredOrders = async (req: IRequest, res: Response) => {
	try {
		const orders = await OrderModel.find({ honored: false }).populate(
			'products'
		)
		res.json(orders)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea comenzilor' })
	}
}

export const honorOrder = async (req: IRequest, res: Response) => {
	try {
		const orderId = req.params.id
		const updatedOrder = await OrderModel.findByIdAndUpdate(
			orderId,
			{
				currentState: OrderStates.HONORED,
			},
			{
				new: true,
			}
		).populate('products')

		if (updatedOrder) {
			res.json(updatedOrder)
		} else {
			res.status(404).json({ message: 'Comanda nu a fost găsită' })
		}
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la actualizarea comenzii',
			stack: err,
		})
	}
}

export const takeOrder = async (req: IRequest, res: Response) => {
	try {
		const orderId = req.params.id
		console.log('beforeUpdate', await OrderModel.findById(orderId))
		const updatedOrder = await OrderModel.findByIdAndUpdate(
			orderId,
			{
				currentState: OrderStates.TAKEN,
			},
			{
				new: true,
			}
		).populate('products')
		console.log('updatedOrder', updatedOrder)
		if (updatedOrder) {
			res.json(updatedOrder)
		} else {
			res.status(404).json({ message: 'Comanda nu a fost găsită' })
		}
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la actualizarea comenzii',
			stack: err,
		})
	}
}

export const getOrder = async (req: IRequest, res: Response) => {
	try {
		const order = await OrderModel.findById(req.params.id).populate(
			'products'
		)
		if (order) {
			res.json(order)
		} else {
			res.status(404).json({ message: 'Comanda nu a fost găsită' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea comenzii' })
	}
}
export const getOrdersByTable = async (req: IRequest, res: Response) => {
	try {
		const orders = await OrderModel.find({
			tableNumber: req.params.tableNumber,
		}).populate('products')
		res.json(orders)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea comenzilor' })
	}
}

export const handleTableOrder = async (req: IRequest, res: Response) => {
	try {
	} catch (e) {
		console.log(e)
		return res
			.status(500)
			.json({ error: 'Eroare la actualizarea comenzii' })
	}
}
