import { Request } from 'express'
import { User } from '../shared/types'
import { File } from 'buffer'
export interface IRequest extends Request {
	user?: User
}
