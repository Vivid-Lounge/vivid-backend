import { Document } from 'mongoose'
export interface User extends Document {
	firstName: string
	lastName: string
	role: number
	accountUsername: string
	accountPassword?: string
	createdBy: string
	isOnline: boolean
	createdAt: Date
	updatedAt: Date
}
