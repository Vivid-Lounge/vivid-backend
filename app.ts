import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import productRoutes from './src/routes/product.routes'
import orderRoutes from './src/routes/order.routes'
import qrRoutes from './src/routes/qr.routes'
import authRoutes from './src/routes/auth.routes'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import eventRoutes from './src/routes/event.routes'
import categoriesRoutes from './src/routes/category.routes'
dotenv.config()
const app = express()
mongoose
	.connect('mongodb://127.0.0.1:27017/restaurant')
	.then(() => console.log('Conectat la baza de date MongoDB'))
	.catch((err) => {
		console.error('Eroare la conectare la baza de date:', err)
	})

app.use(express.json())
app.use(
	cors({
		credentials: true,
		origin: ['http://localhost:5173', 'http://localhost:5174'],
	})
)
app.use(cookieParser())
app.use('/images', express.static(path.join(__dirname, './public/images')))
app.use('/qrcodes', express.static(path.join(__dirname, './public/qrcodes')))

app.use('/api', [
	productRoutes,
	orderRoutes,
	eventRoutes,
	qrRoutes,
	authRoutes,
	categoriesRoutes,
])

app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error(err.stack)
		res.status(500).send('Ceva nu a funcționat corect!')
	}
)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log(`Serverul rulează pe portul ${PORT}`)
})
