import { Request, Response, NextFunction } from 'express'
import { IRequest } from 'types'

export const isAdminMiddleware = (
	req: IRequest,
	res: Response,
	next: NextFunction
) => {
	console.log(req.user, 'dwdwdw')
	if (req.user && req.user.role === 0) {
		next()
	} else {
		res.status(401)
		throw new Error('Unauthorized')
	}
}
