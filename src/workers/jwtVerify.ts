import { Request } from 'express'
import jwt from 'jsonwebtoken'
export const jwtVerify = (token: string) => {
	try {
		jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
			if (err) {
				throw new Error('Invalid token')
			} else {
				return decoded
			}
		})
	} catch (err) {
		return null
	}
}
