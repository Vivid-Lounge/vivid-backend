import {
	createEvent,
	deleteEvents,
	getEvent,
	getEvents,
	updateEvent,
} from '../controllers/event.controller'
import { Router } from 'express'
import multer from 'multer'
import { setupUploadDirectories } from '../workers/setupUploadDir'
const uploadDir = setupUploadDirectories()
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`)
	},
})
const upload = multer({
	storage,
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
		{
			name: 'posterImage',
			maxCount: 1,
		},
		{
			name: 'coverImage',
			maxCount: 1,
		},
	]),
	createEvent
)

router.put(
	'/events/:id',
	upload.fields([
		{
			name: 'posterImage',
			maxCount: 1,
		},
		{
			name: 'coverImage',
			maxCount: 1,
		},
	]),
	updateEvent
)

export default router
