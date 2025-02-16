import { Router } from 'express'
import {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	toggleProductVisibility,
} from '../controllers/product.controller'
import { body } from 'express-validator'
import multer from 'multer'
import { authMiddleware } from '../workers/middlewares'
import { setupImagesDirectory } from '../workers/setupUploadDir'
import { compressImage } from '../workers/middlewares'

const router = Router()

// Configure multer for file uploads
const uploadDir = setupImagesDirectory()
const storage = multer.memoryStorage() // Use memory storage for multer

const upload = multer({
	storage,
	limits: {
		fileSize: 150 * 1024 * 1024, // limit file size to 5MB
	},
	fileFilter: (req, file, cb) => {
		if (file.fieldname === 'image') {
			cb(null, true)
		} else {
			cb(null, false)
		}
	},
})

router.get('/products', authMiddleware, getProducts)
router.get('/products/:id', authMiddleware, getProduct)

router.post(
	'/products',
	upload.single('image'),
	[
		body('name').notEmpty().withMessage('Numele este obligatoriu'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Prețul trebuie să fie pozitiv'),
	],
	authMiddleware,
	compressImage,
	createProduct
)

router.put(
	'/products/:id',
	upload.single('image'),
	authMiddleware,
	compressImage,
	updateProduct
)

router.delete('/products/:id', authMiddleware, deleteProduct)
router.put('/products/:id/toggle', authMiddleware, toggleProductVisibility)

export default router
