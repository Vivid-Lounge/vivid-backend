import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getBearerToken } from '../getBearerToken'
export const ensureClientVeridicity = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		console.log('initialAuthMiddleware')
		const token = getBearerToken(req)
		console.log(token, 'clienttoken')
		if (!token) {
			return res
				.status(401)
				.json({ message: 'Access denied at client token' })
		}
		jwt.verify(
			token,
			process.env.CLIENT_JWT_SECRET as string,
			(err: any, decoded: any) => {
				if (err) {
					return res
						.status(401)
						.json({ message: 'Access denied at jwt verify', err })
				} else {
					console.log('client verified with decoded', decoded)
					next()
				}
			}
		)
	} catch (error) {
		res.status(400).json({ message: 'Invalid token' })
	}
}
