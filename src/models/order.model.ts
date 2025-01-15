import mongoose from 'mongoose'
import { OrderStates, Order } from '../shared/types'
const orderSchema = new mongoose.Schema(
	{
		tableNumber: { type: Number, required: true },
		products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
		currentState: {
			type: String,
			enum: Object.values(OrderStates),
			required: true,
			default: OrderStates.NOT_TAKEN,
		},
	},
	{
		timestamps: true,
	}
)

export default mongoose.model<Order>('Order', orderSchema)
