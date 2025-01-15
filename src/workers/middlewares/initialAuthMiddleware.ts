import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getBearerToken } from '../getBearerToken'
export const initialAuthMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = getBearerToken(req)
		console.log(token, 'clienttoken')
		console.log(process.env.CLIENT_JWT_SECRET)
		if (!token) {
			return res.status(401).json({ message: 'Access denied at' })
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
					next()
				}
			}
		)
	} catch (error) {
		res.status(400).json({ message: 'Invalid token' })
	}
}
