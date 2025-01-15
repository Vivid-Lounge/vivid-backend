import { Router } from 'express'
import {
	generateQR,
	getQRCode,
	getQRCodes,
	deleteQRCode,
	deleteAllQRCodes,
} from '../controllers/qr.controller'
import { body } from 'express-validator'
import { authMiddleware, isAdminMiddleware } from '../workers/middlewares'

const router = Router()

router.get('/qr', authMiddleware, getQRCodes)
router.delete('/qr', authMiddleware, isAdminMiddleware, deleteAllQRCodes)
router.get('/qr/:id', authMiddleware, isAdminMiddleware, getQRCode)
router.delete('/qr/:id', authMiddleware, isAdminMiddleware, deleteQRCode)
router.post(
	'/qr',
	[body('numTables')],
	authMiddleware,
	isAdminMiddleware,
	generateQR
)

export default router
