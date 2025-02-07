import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getBearerToken } from '../getBearerToken'
export const ensureClientVeridicity = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		console.log('we in ensure client veridicity')
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
						.json({
							message:
								'Access denied at jwt verify ensure client veridicity',
							err,
						})
				} else {
					if (
						decoded.iss === process.env.CLIENT_ISSUER_URI &&
						decoded.aud === process.env.API_URI
					) {
						next()
					} else
						return res.status(401).json({
							message:
								'access forbidden. owner has been contacted',
						})
				}
			}
		)
	} catch (error) {
		res.status(400).json({ message: 'Invalid token' })
	}
}
