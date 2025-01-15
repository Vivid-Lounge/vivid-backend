import { Request } from 'express'
import { IRequest } from 'types'
export const getBearerToken = (req: IRequest) => {
	if (req.headers.authorization) {
		return req.headers.authorization.split(' ')[1].toString()
	} else {
		return null
	}
}
