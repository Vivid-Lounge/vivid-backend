import { Request, Response, NextFunction } from 'express'
import sharp from 'sharp'

export const compressImage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.file && !req.files) return next()

	try {
		if (req.file) {
			// Handle single file upload
			const file = req.file
			const { buffer, originalname } = file
			const timestamp = Date.now()
			const ref = `${timestamp}-${originalname}`

			const compressedImage = await sharp(buffer)
				.resize({
					width: 1000,
					height: 1000,
					fit: 'inside',
				}) // Resize to max width of 1000px (maintain aspect ratio)
				.webp({
					quality: 90,
				}) // Convert to WebP format with 90% quality
				.toBuffer()

			file.buffer = compressedImage
			file.originalname = `${ref}.webp`
			console.log('Image compressed', file.originalname)
		} else if (req.files) {
			// Handle multiple file uploads
			const files = req.files as {
				[fieldname: string]: Express.Multer.File[]
			}

			for (const fieldname in files) {
				for (const file of files[fieldname]) {
					const { buffer, originalname } = file
					const sanitizedOriginalName = originalname
						.replace(/\s+/g, '_')
						.replace(/[^a-zA-Z0-9._-]/g, '')
					const ref = sanitizedOriginalName.replace(/\.[^/.]+$/, '')

					const compressedImage = await sharp(buffer)
						.resize({
							width: 1000,
							height: 1000,
							fit: 'inside',
						}) // Resize to max width of 1000px (maintain aspect ratio)
						.webp({
							quality: 90,
						}) // Convert to WebP format with 90% quality
						.toBuffer()

					file.buffer = compressedImage
					file.originalname = `${ref}.webp`
					console.log('Image compressed', file.originalname)
				}
			}
		}
		next()
	} catch (error) {
		console.error('Error compressing image:', error)
		res.status(500).json({ error: 'Error compressing image' })
	}
}
