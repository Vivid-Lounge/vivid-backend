import { Router } from 'express'
import {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
} from '../controllers/product.controller'
import { body } from 'express-validator'
import multer from 'multer'
import { authMiddleware } from '../workers/middlewares'
const router = Router()
// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/images') // Specify the destination folder
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`) // Specify the file naming convention
	},
})

const upload = multer({ storage })
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
	createProduct
)

router.put(
	'/products/:id',
	upload.single('image'),
	authMiddleware,
	updateProduct
)
router.delete('/products/:id', authMiddleware, deleteProduct)

export default router
