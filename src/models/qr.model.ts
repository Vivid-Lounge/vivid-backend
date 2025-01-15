import mongoose, { Document } from 'mongoose'
import { number } from 'zod'
import { QR } from '../shared/types'
const qrSchema = new mongoose.Schema({
	tableUrl: { type: String, required: true },
	tableNumber: { type: Number, required: true },
	orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
	imageUrl: { type: String },
})

export default mongoose.model<QR>('QR', qrSchema)
