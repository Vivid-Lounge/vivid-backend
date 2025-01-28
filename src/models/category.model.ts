import mongoose from 'mongoose'
import { Category } from 'shared/types'

const CategorySchema = new mongoose.Schema({
	name: { type: String, required: true },
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		default: null,
	},
})

export default mongoose.model<Category>('Category', CategorySchema)
