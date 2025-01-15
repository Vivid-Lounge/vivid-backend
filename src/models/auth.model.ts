import mongoose, { Document } from 'mongoose'
import { string } from 'zod'
import { User } from '../shared/types'
const accountSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	accountUsername: { type: String, required: true },
	accountPassword: { type: String, required: true },
	privilage: { type: Number, required: true, default: 0 },
	isOnline: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<User>('Account', accountSchema)
