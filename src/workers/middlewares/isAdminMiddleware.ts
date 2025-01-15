import { Request, Response, NextFunction } from 'express'
import { IRequest } from 'types'

export const isAdminMiddleware = (
	req: IRequest,
	res: Response,
	next: NextFunction
) => {
	if (req.user && req.user.privilage == 2) {
		next()
	} else {
		res.status(401)
		throw new Error('Unauthorized')
	}
}
