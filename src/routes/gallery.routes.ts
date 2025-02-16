import { Router } from 'express'
import {
	getGallery,
	insertImages,
	deleteImage,
	updateGallery,
} from '../controllers/gallery.controller'
import { setupGalleryDirectory } from '../workers/setupUploadDir'
import { body } from 'express-validator'
import multer from 'multer'
import { authMiddleware } from '../workers/middlewares'
import { compressImage } from '../workers/middlewares'

const uploadDir = setupGalleryDirectory()
const storage = multer.memoryStorage() // Use memory storage for multer

const upload = multer({
	storage,
	limits: {
		fileSize: 100 * 1024 * 1024, // limit file size to 5MB
	},
	fileFilter: (req, file, cb) => {
		if (file.fieldname === 'images') {
			cb(null, true)
		} else {
			cb(null, false)
		}
	},
})
const router = Router()

router.get('/gallery', getGallery)
router.post(
	'/gallery',
	authMiddleware,
	upload.fields([
		{
			name: 'images',
			maxCount: 32,
		},
	]),
	compressImage,
	insertImages
)
router.put('/gallery', authMiddleware, updateGallery)
router.put('/deleteImage', authMiddleware, deleteImage)

export default router
