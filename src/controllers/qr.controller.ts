import { Response } from 'express'
import QRModel from '../models/qr.model'
import { QR } from '../shared/types'
import { table } from 'console'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import fs_async from 'fs/promises'
import path from 'path'
import * as Jimp from 'jimp'
import QRCode from 'qrcode'
import orderModel from '../models/order.model'
import { IRequest } from 'types'

export const generateQR = async (req: IRequest, res: Response) => {
	try {
		let { numTables } = req.body
		numTables = parseInt(numTables, 10)
		const newQRCodes: QR[] = []
		const currQRCodes = await QRModel.find()
		const qrCodesLength = currQRCodes.length

		for (let i = qrCodesLength + 1; i <= qrCodesLength + numTables; i++) {
			console.log('i', i)
			let tableUrl = `http://localhost:5173/table/masa/${i}`
			let tableNumber = i
			const randomUUID = uuidv4()
			const qrBuffer = await QRCode.toBuffer(tableUrl, {
				width: 800,
				type: 'png',
				errorCorrectionLevel: 'H',
				margin: 1,
				color: {
					dark: '#000000',
					light: '#FFFFFF',
				},
			})

			const qrImage = await Jimp.Jimp.read(qrBuffer)

			const logoPath = path.join(__dirname, '../public/logo/logo.png')
			const logoImage = await Jimp.Jimp.read(logoPath)

			const qrWidth = qrImage.bitmap.width
			const qrHeight = qrImage.bitmap.height

			const logoWidth = qrWidth / 3.2
			const logoHeight = qrHeight / 4

			logoImage.resize({ w: logoWidth, h: logoHeight })

			const xPos = (qrWidth - logoWidth) / 2
			const yPos = (qrHeight - logoHeight) / 2

			qrImage.composite(logoImage, xPos, yPos, {
				opacitySource: 1,
				opacityDest: 1,
			})

			const finalBuffer = qrImage.getBuffer(Jimp.JimpMime.png)

			const imageUrl = `table_${tableUrl
				.split('/')
				.pop()}___${randomUUID}.png`

			const folderPath = path.join(__dirname, '../public/qrcodes')

			await fs_async.mkdir(folderPath, { recursive: true })

			const filePath = path.join(folderPath, imageUrl)

			await fs_async.writeFile(filePath, await finalBuffer)

			const newQRCode = new QRModel({
				tableUrl,
				tableNumber,
				imageUrl,
			})

			newQRCodes.push(newQRCode)
			console.log('running')
		}

		await QRModel.insertMany(newQRCodes)
		console.log(newQRCodes)
		res.status(200).json(newQRCodes)
	} catch (err) {
		console.error('Eroare la generarea codului QR:', err)
		res.status(500).json({ error: 'Eroare la generarea codului QR' })
	}
}

export const getQRCodes = async (req: IRequest, res: Response) => {
	try {
		const qrCodes = await QRModel.find()
		res.status(200).json(qrCodes)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea codurilor QR' })
	}
}
export const deleteQRCode = async (req: IRequest, res: Response) => {
	try {
		const qrCode = await QRModel.findById(req.params.id)
		if (qrCode) {
			console.log(qrCode.tableUrl.split('/')[5])
			await orderModel.deleteMany({
				tableNumber: qrCode.tableUrl.split('/')[5],
			})
			await QRModel.findByIdAndDelete(req.params.id)
			const filePath = path.join(
				__dirname,
				'../public/qrcodes',
				qrCode.imageUrl
			)
			fs.unlinkSync(filePath)
			res.status(200).json({ message: 'Codul QR a fost șters' })
		} else {
			res.status(404).json({ message: 'Codul QR nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la ștergerea codului QR' })
	}
}
export const deleteAllQRCodes = async (req: IRequest, res: Response) => {
	try {
		const qrCodes = await QRModel.find()
		if (qrCodes) {
			await QRModel.deleteMany({})
			await orderModel.deleteMany({})
			const folderPath = path.join(__dirname, '../public/qrcodes')
			const files = fs.readdirSync(folderPath)
			for (const file of files) {
				fs.unlinkSync(path.join(folderPath, file))
			}
			res.status(200).json({
				message: 'Toate codurile QR au fost șterse',
			})
		} else {
			res.status(404).json({ message: 'Codurile QR nu au fost găsite' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la ștergerea codurilor QR' })
	}
}
export const getQRCode = async (req: IRequest, res: Response) => {
	try {
		const qrCode = await QRModel.findById(req.params.id)
			.populate('orders')
			.populate({
				path: 'orders',
				populate: {
					path: 'products',
					model: 'Product',
				},
			})

		if (qrCode) {
			res.json(qrCode)
		} else {
			res.status(404).json({ message: 'Codul QR nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea codului QR' })
	}
}
