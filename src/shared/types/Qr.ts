import mongoose from 'mongoose'

export interface QR extends Document {
	tableUrl: string
	tableNumber: number
	orders: mongoose.Schema.Types.ObjectId[]
	imageUrl: string
}
