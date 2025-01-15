import mongoose from 'mongoose'
import { Order } from './Order'

export interface Table extends Document {
	number: number
	orders: Order[] | mongoose.Schema.Types.ObjectId[]
	createdAt: Date
	updatedAt: Date
}
