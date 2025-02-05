import fs from 'fs'
import path from 'path'

export const setupGalleryDirectory = () => {
	const uploadDir = path.join(process.cwd(), 'public', 'gallery')
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true })
	}
	return uploadDir
}

export const setupImagesDirectory = () => {
	const uploadDir = path.join(process.cwd(), 'public', 'images')
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true })
	}
	return uploadDir
}

