import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import bodyParser from 'body-parser'
import productRoutes from './src/routes/product.routes'
import orderRoutes from './src/routes/order.routes'
import qrRoutes from './src/routes/qr.routes'
import authRoutes from './src/routes/auth.routes'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import eventRoutes from './src/routes/event.routes'
import categoriesRoutes from './src/routes/category.routes'
import galleryRoutes from './src/routes/gallery.routes'
dotenv.config()
const app = express()
const password = encodeURIComponent(`${process.env.MONGODB_PASSWORD}`)
const username = encodeURIComponent(`${process.env.MONGODB_USERNAME}`)
console.log(password, username)
const mongo_uri = `mongodb+srv://${username}:${password}@cluster.rvasy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`
mongoose
	.connect(mongo_uri)
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => {
		console.error('Error connecting to MongoDB:', err)
	})

// mongoose.connect('127.0.0.1')

app.use(express.json())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(
	cors({
		credentials: true,
		origin: true,
	})
)
app.use(cookieParser())
app.use('/images', express.static(path.join(__dirname, './public/images')))
app.use('/qrcodes', express.static(path.join(__dirname, './public/qrcodes')))
app.use('/gallery', express.static(path.join(__dirname, './public/gallery')))

app.get('/api/', (req, res) => {
	console.log('Hello World!')
	res.send('Hello World!')
})
app.use('/api', [
	productRoutes,
	orderRoutes,
	eventRoutes,
	qrRoutes,
	authRoutes,
	categoriesRoutes,
	galleryRoutes,
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

const PORT = 4000

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
