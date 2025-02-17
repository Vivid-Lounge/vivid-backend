import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../../shared/types'
import { getBearerToken } from '../getBearerToken'
import { IRequest } from '../../types'
export const authMiddleware = async (
	req: IRequest,
	res: Response,
	next: NextFunction
) => {
	const token = getBearerToken(req)

	if (!token) {
		console.log('!token')
		return res
			.status(401)
			.json({ message: 'Access denied at !token authmiddlww' })
	}
	try {
		jwt.verify(
			token,
			process.env.BACKEND_JWT_SECRET as string,
			(err: any, decoded: any) => {
				if (err) {
					console.log(err)
					return res.status(401).json({
						message: 'Access denied at jwt verify authmiddlw',
					})
				}
				req.user = decoded as User
				if (
					(decoded.iss =
						process.env.API_URI &&
						decoded.aud === process.env.CLIENT_ISSUER_URI)
				) {
					console.log('access granted')
					next()
				}
			}
		)
	} catch (error) {
		res.status(400).json({ message: 'Invalid token' })
	}
}
