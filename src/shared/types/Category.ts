import mongoose, { Document } from 'mongoose'

export interface Category extends Document {
	name: string
	parent?: mongoose.Schema.Types.ObjectId
	_id: string
}
