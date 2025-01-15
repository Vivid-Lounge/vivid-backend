import mongoose from 'mongoose'
import { Document } from 'mongoose'
import { Table } from '../shared/types'
const TableSchema = new mongoose.Schema(
	{
		number: { type: Number, required: true },
		qrCode: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'QR',
		},
		orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
	},
	{
		timestamps: true,
	}
)

export default mongoose.model<Table>('Table', TableSchema)
