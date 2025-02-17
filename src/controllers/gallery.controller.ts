import { Response } from 'express'
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
			gallery = new GalleryModel({ imageArray: [] })
		}

		if (!files?.images?.length) {
			return res.status(500).json({ error: 'Nu s-au primit imagini!' })
		}

		const chunkSize = 3
		for (let i = 0; i < files.images.length; i += chunkSize) {
			const chunk = files.images.slice(i, i + chunkSize)
			await Promise.all(
				chunk.map(async (file) => {
					try {
						const imagePath = path.join(
							__dirname,
							`../../public/gallery/${file.originalname}`
						)

						const maxRetries = 3
						let retries = 0
						while (retries < maxRetries) {
							try {
								await fs_async.writeFile(imagePath, file.buffer)
								break
							} catch (writeError) {
								retries++
								if (retries === maxRetries) throw writeError
								// Wait before retrying
								await new Promise((resolve) =>
									setTimeout(resolve, 1000)
								)
							}
						}

						const newImage = new ImageModel({
							imageUrl: file.originalname,
							priority: 1,
						})
						gallery.imageArray.push(newImage)
					} catch (fileError) {
						console.error(
							`Error processing file ${file.originalname}:`,
							fileError
						)
						// Continue with other files if one fails
					}
				})
			)
		}

		const savedGallery = await gallery.save()
		res.json(savedGallery.toObject({ versionKey: false }))
	} catch (err) {
		console.error('Error in insertImages:', err)
		res.status(500).json({
			error: 'Eroare la inserarea imaginii',
			msg: err instanceof Error ? err.message : 'Unknown error',
		})
	}
}

export const deleteImage = async (req: IRequest, res: Response) => {
	try {
		const imageId = req.body.data.imageArray as string[]
		const gallery = await GalleryModel.findOne({})
		if (!gallery) {
			return res.status(404).json({ message: 'Galeria nu a fost găsită' })
		}
		imageId.forEach((element) => {
			const foundImageIndex = gallery.imageArray.findIndex(
				(x) => x._id.toString() === element
			)
			const foundImage = gallery.imageArray.find(
				(x) => x._id.toString() === element
			)
			if (foundImageIndex !== -1) {
				gallery.imageArray.splice(foundImageIndex, 1)
				if (
					fs.existsSync(
						path.join(
							__dirname,
							`../../public/gallery/${foundImage?.imageUrl}`
						)
					)
				) {
					fs.unlinkSync(
						path.join(
							__dirname,
							`../../public/gallery/${foundImage?.imageUrl}`
						)
					)
				}
			}
		})

		await gallery.save()
		res.json({ message: 'Imagine ștearsă din galerie' })
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la ștergerea imaginii',
			msg: err,
		})
	}
}

export const updateGallery = async (req: IRequest, res: Response) => {
	try {
		const order = req.body
		if (!order || !Array.isArray(order)) {
			return res.status(400).json({ error: 'Ordonare greșită.' })
		}

		const gallery = await GalleryModel.findOne({})
		if (!gallery) {
			return res.status(404).json({ message: 'Galeria nu a fost găsită' })
		}

		const imageMap = new Map<string, (typeof gallery.imageArray)[number]>(
			gallery.imageArray.map((img) => [img._id.toString(), img])
		)

		const reorderedImages = order
			.map((id) => imageMap.get(id))
			.filter((img): img is (typeof gallery.imageArray)[number] =>
				Boolean(img)
			)

		const missingImages = gallery.imageArray.filter(
			(img) => !order.includes(img._id.toString())
		)
		gallery.imageArray = [...reorderedImages, ...missingImages]

		gallery.imageArray = reorderedImages

		const savedGallery = await gallery.save()
		const actualGallery = savedGallery.toObject({ versionKey: false })
		res.json(actualGallery)
	} catch (err) {
		console.error(err)
		res.status(500).json({
			error: 'Eroare la actualizarea galeriei',
			msg: err,
		})
	}
}
