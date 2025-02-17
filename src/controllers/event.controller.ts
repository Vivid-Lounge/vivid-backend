import { IRequest } from 'types'
import { Response } from 'express'
import EventModel from '../models/event.model'
import path from 'path'
import fs from 'fs'
import fs_async from 'fs/promises'
import mongoose from 'mongoose'

export const getEvents = async (req: IRequest, res: Response) => {
	try {
		const events = await EventModel.find()
		res.json(events)
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la preluarea evenimentelor',
			stack: err,
		})
	}
}

export const getEvent = async (req: IRequest, res: Response) => {
	try {
		const { slug } = req.params
		let event

		if (mongoose.Types.ObjectId.isValid(slug)) {
			event = await EventModel.findById(slug)
		} else {
			event = await EventModel.findOne({ slug })
		}
		if (event) {
			res.json(event)
		} else {
			res.status(404).json({ message: 'Evenimentul nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la preluarea evenimentului',
			stack: err,
		})
	}
}

export const createEvent = async (req: IRequest, res: Response) => {
	try {
		const { title, phone, date, ticketsLink, description } = req.body
		console.log(req.body)
		console.log(req.files, 'req.files')
		const files = req.files as {
			[fieldname: string]: Express.Multer.File[]
		}

		const slug = title ? title.toLowerCase().replace(/ /g, '-') : date

		const posterImagePath = path.join(
			__dirname,
			`../../public/images/${files.posterImage[0].originalname}`
		)
		await fs_async.writeFile(posterImagePath, files.posterImage[0].buffer)

		const coverImagePath = path.join(
			__dirname,
			`../../public/images/${files.coverImage[0].originalname}`
		)
		await fs_async.writeFile(coverImagePath, files.coverImage[0].buffer)

		const posterImage = `/images/${files.posterImage[0].originalname}`
		const coverImage = `/images/${files.coverImage[0].originalname}`

		const newEvent = new EventModel({
			title,
			posterImage,
			coverImage,
			date,
			phone,
			ticketsLink,
			description,
			slug,
		})

		const savedEvent = await newEvent.save()
		console.log(savedEvent)
		res.status(200).json(savedEvent.toObject({ versionKey: false }))
	} catch (err) {
		res.status(500).json({ error: 'Eroare la crearea evenimentului', err })
	}
}

export const updateEvent = async (req: IRequest, res: Response) => {
	try {
		const { title, phone, date, ticketsLink, description } = req.body
		const files = req.files as {
			[fieldname: string]: Express.Multer.File[]
		}

		const event = await EventModel.findById(req.params.id)
		if (!event) {
			return res.status(404).json({ message: 'Event not found' })
		}

		// Delete old images if they exist and new ones are uploaded
		if (files.posterImage && event.posterImage) {
			const oldPosterPath = event.posterImage.split('/').pop() // Get filename from URL
			if (oldPosterPath) {
				const fullOldPosterPath = path.join(
					process.cwd(),
					'public',
					'images',
					oldPosterPath
				)
				if (fs.existsSync(fullOldPosterPath)) {
					fs.unlinkSync(fullOldPosterPath)
				}
			}
		}

		if (files.coverImage && event.coverImage) {
			const oldCoverPath = event.coverImage.split('/').pop()
			if (oldCoverPath) {
				const fullOldCoverPath = path.join(
					process.cwd(),
					'public',
					'images',
					oldCoverPath
				)
				if (fs.existsSync(fullOldCoverPath)) {
					fs.unlinkSync(fullOldCoverPath)
				}
			}
		}

		// Update event with new data
		event.title = title
		event.phone = phone
		event.date = date
		event.ticketsLink = ticketsLink
		event.description = description
		event.slug = title ? title.toLowerCase().replace(/ /g, '-') : date

		// Update image paths if new files uploaded
		if (files.posterImage) {
			const posterImagePath = path.join(
				__dirname,
				`../../public/images/${files.posterImage[0].originalname}`
			)
			await fs_async.writeFile(
				posterImagePath,
				files.posterImage[0].buffer
			)
			event.posterImage = `/images/${files.posterImage[0].originalname}`
		}
		if (files.coverImage) {
			const coverImagePath = path.join(
				__dirname,
				`../../public/images/${files.coverImage[0].originalname}`
			)
			await fs_async.writeFile(coverImagePath, files.coverImage[0].buffer)
			event.coverImage = `/images/${files.coverImage[0].originalname}`
		}

		const updatedEvent = await event.save()
		res.status(200).json(updatedEvent.toObject({ versionKey: false }))
	} catch (err) {
		res.status(500).json({
			error: 'Error updating event',
			stack: err,
		})
	}
}

export const deleteEvents = async (req: IRequest, res: Response) => {
	try {
		const ids = req.body.ids as string[]
		console.log(req.body)
		console.log(ids)
		const foundEvents = await EventModel.find({ _id: { $in: ids } })
		const result = await EventModel.deleteMany({ _id: { $in: ids } })
		console.log(result)
		foundEvents.forEach((e) => {
			console.log(`../../public${e.posterImage}`)

			if (
				fs.existsSync(
					path.join(__dirname, `../../public/${e?.posterImage}`)
				)
			) {
				fs.unlinkSync(
					path.join(__dirname, `../../public/${e?.posterImage}`)
				)
			}
			if (
				fs.existsSync(
					path.join(__dirname, `../../public/${e?.coverImage}`)
				)
			) {
				fs.unlinkSync(
					path.join(__dirname, `../../public/${e?.coverImage}`)
				)
			}
		})
		res.status(200).json({
			message: `${result.deletedCount} events deleted successfully`,
			deletedCount: result.deletedCount,
		})
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la ștergerea evenimentului',
			stack: err,
		})
	}
}
