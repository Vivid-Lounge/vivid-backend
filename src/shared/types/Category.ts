import { Document } from 'mongoose'

export interface Category extends Document {
	name: string
	parent?: string
	_id: string
}
