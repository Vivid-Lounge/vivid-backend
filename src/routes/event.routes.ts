import {
	createEvent,
	deleteEvents,
	getEvent,
	getEvents,
	updateEvent,
} from '../controllers/event.controller'
import { Router } from 'express'
import multer from 'multer'
import { setupImagesDirectory } from '../workers/setupUploadDir'
import { compressImage } from '../workers/middlewares'

const uploadDir = setupImagesDirectory()
const storage = multer.memoryStorage() // Use memory storage for multer

const upload = multer({
	storage,
	// limits: {
	// 	fileSize: 5 * 1024 * 1024, // limit file size to 5MB
	// },
	fileFilter: (req, file, cb) => {
		if (
			file.fieldname === 'posterImage' ||
			file.fieldname === 'coverImage'
		) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	},
})

const router = Router()

router.get('/events', getEvents)
router.get('/events/:slug', getEvent)
router.patch('/events', deleteEvents)

router.post(
	'/events',
	upload.fields([
		{ name: 'posterImage', maxCount: 1 },
		{ name: 'coverImage', maxCount: 1 },
	]),
	compressImage,
	createEvent
)

router.put(
	'/events/:id',
	upload.fields([
		{ name: 'posterImage', maxCount: 1 },
		{ name: 'coverImage', maxCount: 1 },
	]),
	compressImage,
	updateEvent
)

export default router
