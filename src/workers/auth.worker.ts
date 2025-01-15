import jwt from 'jsonwebtoken'
import AuthModel from '../models/auth.model'

export const getValidatedAccount = async (
	jwtToken: string,
	requiredPermission = 2
) => {
	if (jwtToken == null) return null
	const result = jwt.verify(jwtToken, process.env.JWT_SECRET as string)
	if (
		typeof result === 'object' &&
		result !== null &&
		'accountUsername' in result
	) {
		const foundAccount = await AuthModel.findOne({
			accountUsername: (result as { accountUsername: string })
				.accountUsername,
		}).select('-accountPassword')
		if (foundAccount == null) {
			return null
		}

		if (foundAccount.privilage < requiredPermission) {
			return null
		}
		return foundAccount
	} else {
		return null
	}
}
