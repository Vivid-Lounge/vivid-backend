import mongoose, { Schema } from 'mongoose'
import { Event } from 'shared/types'
const EventSchema: Schema = new Schema({
	posterImage: { type: String, default: null },
	coverImage: { type: String, default: null },
	title: { type: String, default: null },
	date: { type: Date, default: null },
	slug: { type: String, default: null },
	phone: { type: String, default: null },
	ticketsLink: { type: String, default: null },
	description: { type: String, default: null },
})

export default mongoose.model<Event>('Event', EventSchema)
