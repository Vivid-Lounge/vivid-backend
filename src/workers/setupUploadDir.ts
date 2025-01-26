import fs from 'fs'
import path from 'path'

export const setupUploadDirectories = () => {
	const uploadDir = path.join(process.cwd(), 'public', 'images')
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true })
	}
	return uploadDir
}
