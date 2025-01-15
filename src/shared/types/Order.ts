import mongoose from 'mongoose'
import { Product } from './Product'

export interface Order extends Document {
	tableNumber: number
	products: Product[] | mongoose.Schema.Types.ObjectId[]
	total: number
	currentState: string
	createdAt: Date
	updatedAt: Date
}
