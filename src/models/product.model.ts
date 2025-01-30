// În src/models/product.model.ts

import mongoose, { Document } from 'mongoose'
import { Product } from '../shared/types'
const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: String,
	price: { type: Number, required: true },
	quantityInGrams: Number,
	parentCategory: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		default: null,
	},
	childCategory: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		default: null,
	},
	isVisible: { type: Boolean, default: true },
	imageUrl: String,
})

export default mongoose.model<Product>('Product', productSchema)
