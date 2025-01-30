import mongoose from 'mongoose'

export interface Product extends Document {
	name: string
	description: string
	price: number
	quantityInGrams: number
	parentCategory: mongoose.Schema.Types.ObjectId | null
	childCategory: mongoose.Schema.Types.ObjectId | null
	isVisible: boolean
	imageUrl: string
}
