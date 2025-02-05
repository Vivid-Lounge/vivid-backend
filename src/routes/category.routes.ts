import Router from 'express'

import {
	getCategories,
	getCategory,
	updateCategory,
	deleteCategory,
	updateCategories,
} from '../controllers/category.controller'

const router = Router()

router.get('/categories', getCategories)
router.get('/categories/:id', getCategory)
router.post('/categories', updateCategories)
router.put('/categories/:id', updateCategory)

router.delete('/categories/:id', deleteCategory)

export default router
