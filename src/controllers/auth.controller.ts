import { Response } from 'express'
import AuthModel from '../models/auth.model'
import { User } from '../shared/types'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { IRequest } from 'types'
export const createAccount = async (req: IRequest, res: Response) => {
	try {
		const {
			firstName,
			lastName,
			accountUsername,
			accountPassword,
			accountConfirmPassword,
			role,
		} = req.body
		console.log(req.body)

		const foundAccount = await AuthModel.find({
			accountUsername: { $in: accountUsername },
		})

		if (foundAccount.length > 0) {
			res.status(422).json({ error: 'Contul deja exista!' })
			return
		}

		if (accountPassword != accountConfirmPassword) {
			res.status(403).json({ error: 'Parolele nu coincid!' })
			return
		}
		const hashedPassword = crypto
			.createHash('sha512')
			.update(accountPassword)
			.digest('hex')

		const newAccount = new AuthModel({
			firstName,
			lastName,
			accountUsername,
			accountPassword: hashedPassword,
			role,
		})

		const savedAccount = await newAccount.save()
		console.log('savedAccount', savedAccount)
		const accountResponse = savedAccount.toObject({
			versionKey: false,
		}) as User
		if (accountResponse && accountResponse.accountPassword) {
			delete accountResponse.accountPassword
		}
		res.status(200).json(accountResponse)
	} catch (err) {
		res.status(500).json({ error: err })
	}
}

export const loginAccount = async (req: IRequest, res: Response) => {
	try {
		const { accountUsername, accountPassword } = req.body.credentials
		console.log(req.body)
		const foundAccount = await AuthModel.findOne({
			accountUsername,
		})

		if (foundAccount == null) {
			res.status(403).json('Acest cont nu exista!')
			return
		}
		const hashedPassword = crypto
			.createHash('sha512')
			.update(accountPassword)
			.digest('hex')

		if (foundAccount.accountPassword != hashedPassword) {
			res.status(403).json('Parola este incorecta!')
			return
		}

		const tokenSecret = process.env.BACKEND_JWT_SECRET
		if (!tokenSecret) {
			res.status(500).json({ error: 'JWT_SECRET is not defined' })
			return
		}
		const accountPrivilage = foundAccount.role
		jwt.sign(
			{
				_id: foundAccount._id,
				accountUsername: accountUsername,
				role: foundAccount.role,
			},
			tokenSecret,
			{
				expiresIn: '24h',
			},
			async (err, token) => {
				if (err) throw err
				await AuthModel.findByIdAndUpdate(foundAccount._id, {
					isOnline: true,
				})
				return res.cookie('token', token).status(200).json({
					username: accountUsername,
					role: accountPrivilage,
					token: token,
				})
			}
		)
	} catch (err) {
		console.error('Error during JWT signing:', err)
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}
export const logout = async (req: IRequest, res: Response) => {
	try {
		const user = req.user
		if (user?._id) {
			await AuthModel.findByIdAndUpdate(user._id, {
				isOnline: false,
			})
			return res.status(200).json({ message: 'Logged out' })
		} else {
			throw new Error('User not found')
		}
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}
export const deleteAccount = async (req: IRequest, res: Response) => {
	try {
		if (!req.user) {
			return res
				.status(405)
				.json('Nu ai fost autentificat sau nu ai permisiune necesare!')
		}
		const { accountUsername } = req.body
		console.log('accountUsername', req.body)
		if (!accountUsername) {
			return res
				.status(400)
				.json({ error: 'Nu exista un username specificat.' })
		}

		const deletedAccount = await AuthModel.findOneAndDelete({
			accountUsername: accountUsername,
		})

		if (!deletedAccount) {
			return res.status(404).json({ error: 'Contul nu a fost gasit.' })
		}

		res.status(200).json({ message: 'Contul a fost sters cu succes.' })
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}

export const getAccounts = async (req: IRequest, res: Response) => {
	try {
		if (req.user) {
			const accounts = (await AuthModel.find()).filter(
				(account) => account._id != req.user?._id
			)

			res.status(200).json(accounts)
		} else {
			throw new Error('User not found')
		}
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}

export const alterAccount = async (req: IRequest, res: Response) => {
	try {
		const { id } = req.params
		const { firstName, lastName, accountUsername, accountPassword, role } =
			req.body

		const updatedAccount = await AuthModel.findByIdAndUpdate(
			id,
			{
				firstName,
				lastName,
				accountUsername,
				accountPassword,
				role,
			},
			{ new: true }
		)

		if (!updatedAccount) {
			return res.status(404).json({ error: 'Contul nu a fost gasit.' })
		}

		res.status(200).json(updatedAccount)
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}

export const retrieveMe = async (req: IRequest, res: Response) => {
	try {
		const user = req.user
		const userDoc = await AuthModel.findById(user?._id)
			.select('-accountPassword')
			.select('-__v')
		console.log('user', user)
		if (user?._id) {
			return res.status(200).json(userDoc)
		} else {
			throw new Error('User not found')
		}
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message, stack: err.stack })
		} else {
			res.status(500).json({ error: 'Unknown error' })
		}
	}
}
