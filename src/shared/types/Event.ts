import { Document } from 'mongoose'

export interface Event {
	title: string | null
	posterImage: string | null
	coverImage: string | null
	date: Date | null
	ticketsLink: string | null
	phone?: string | null
	slug?: string | null
	description: string | null
	_id: string
}
