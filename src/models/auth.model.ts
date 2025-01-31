import mongoose, { Document } from 'mongoose'
import { string } from 'zod'
import { User } from '../shared/types'
import { UserRoles } from '../shared/types'
import { getNumericEnumValues } from '../shared/helpers/'
const rolesByNumber = getNumericEnumValues(UserRoles)
const accountSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	accountUsername: { type: String, required: true },
	accountPassword: { type: String, required: true },
	role: {
		type: Number,
		required: true,
		enum: rolesByNumber,
		default: UserRoles.ADMIN,
	},
	isOnline: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<User>('Account', accountSchema)
