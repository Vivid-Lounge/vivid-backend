import { Router } from 'express'
import {
	createAccount,
	loginAccount,
	deleteAccount,
	logout,
	getAccounts,
	alterAccount,
	retrieveMe,
} from '../controllers/auth.controller'
import { body } from 'express-validator'
import {
	authMiddleware,
	isAdminMiddleware,
	initialAuthMiddleware,
} from '../workers/middlewares'

const router = Router()

router.get('/accounts', authMiddleware, isAdminMiddleware, getAccounts)
// router.post('/login', loginAccount);

router.post(
	'/login',
	[body('accountUsername'), body('accountPassword')],
	initialAuthMiddleware,
	loginAccount
)
router.get('/logout', authMiddleware, logout)
router.delete(
	'/deleteAccount',
	[body('accountUsername')],
	authMiddleware,
	isAdminMiddleware,
	deleteAccount
)
router.put('/account/:id', authMiddleware, isAdminMiddleware, alterAccount)
router.get('/retrieve-me', authMiddleware, retrieveMe)
router.post(
	'/createaccount',
	[
		body('firstName'),
		body('lastName'),

		body('accountUsername'),
		body('accountPassword'),
		body('privilage')
			.isInt({ gt: 0 })
			.withMessage('Permisiunile acordate utilizatorului sunt invalide!'),
	],
	authMiddleware,
	isAdminMiddleware,
	createAccount
)

export default router
