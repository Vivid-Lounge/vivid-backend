import { Response, Request } from 'express'
import GalleryModel from '../models/gallery.model'
import ImageModel from '../models/image.model'
import path from 'path'
import fs from 'fs'
import fs_async from 'fs/promises'
import { IRequest } from 'types'

export const getGallery = async (req: IRequest, res: Response) => {
	try {
		const gallery = await GalleryModel.find()
		res.json(gallery)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea galeriei' })
	}
}
export const insertImages = async (req: IRequest, res: Response) => {
	try {
		const files = req.files as
			| { [fieldname: string]: Express.Multer.File[] }
			| undefined
		let gallery = await GalleryModel.findOne({})
		if (!gallery) {
			gallery = new GalleryModel({ images: [] })
		}

		if (!files?.images?.length) {
			return res.status(500).json({ error: 'Nu s-au primit imagini!' })
		}

		for (const file of files.images) {
			const newImage = new ImageModel({
				imageUrl: file.filename,
				priority: 1,
			})
			gallery.imageArray.push(newImage)
		}
		const savedGallery = await gallery.save()
		res.json(savedGallery.toObject({ versionKey: false }))
	} catch (err) {
		console.log(err)
		res.status(500).json({
			error: 'Eroare la inserarea imaginii',
			msg: err,
		})
	}
}

export const deleteImage = async (req: IRequest, res: Response) => {
	try {
		const { galleryId, imageId } = req.body
		const gallery = await GalleryModel.findById(galleryId)
		if (!gallery) {
			return res.status(404).json({ message: 'Galeria nu a fost găsită' })
		}
		const imageIndex = gallery.imageArray.findIndex(
			(image) => image.body.id.toString() === imageId
		)
		if (imageIndex !== -1) {
			gallery.imageArray.splice(imageIndex, 1)
		}
		await gallery.save()
		res.json({ message: 'Imagine ștearsă din galerie' })
	} catch (err) {
		res.status(500).json({ error: 'Eroare la ștergerea imaginii' })
	}
}

export const updateGallery = async (req: IRequest, res: Response) => {
	try {
		const { id, imageArray } = req.body
		const gallery = await GalleryModel.findById(id)
		if (!gallery) {
			res.status(404).json({ message: 'Galeria nu a fost găsită' })
			return
		}

		gallery.imageArray = imageArray
		const savedGallery = await gallery.save()
		const actualGallery = savedGallery.toObject({ versionKey: false })
		res.json(actualGallery)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la actualizarea galeriei' })
	}
}
