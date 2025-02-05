import { Response, Request } from 'express'
import ProductModel from '../models/product.model'
import path from 'path'
import fs from 'fs'
import { IRequest } from 'types'
import CategoryModel from '../models/category.model'
export const getProducts = async (req: IRequest, res: Response) => {
	try {
		const products = await ProductModel.find()
			.select('-__v')
			.populate('parentCategory')
			.populate('childCategory')

		res.json(products)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea produselor' })
	}
}

export const getProduct = async (req: IRequest, res: Response) => {
	try {
		const product = await ProductModel.findById(req.params.id)

		if (product) {
			res.json(product)
		} else {
			res.status(404).json({ message: 'Produsul nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea produsului' })
	}
}

export const createProduct = async (req: Request, res: Response) => {
	try {
		const { name, description, price, quantityInGrams, parentId, childId } =
			req.body
		console.log(req.body)
		const file = req.file as Express.Multer.File
		const parentCategoryDoc = await CategoryModel.findById(parentId)
		const childCategoryDoc = childId
			? await CategoryModel.findById(childId)
			: null

		const imageUrl = `/images/${file.filename}`

		const newProduct = new ProductModel({
			name,
			description,
			price,
			quantityInGrams,
			parentCategory: parentCategoryDoc ? parentCategoryDoc._id : null,
			childCategory: childCategoryDoc ? childCategoryDoc._id : null,
			imageUrl,
		})

		const savedProduct = await newProduct.save()
		const actualProduct = savedProduct.toObject({ versionKey: false })
		res.status(200).json(actualProduct)
	} catch (err) {
		console.log(err)
		res.status(500).json({ error: 'Eroare la crearea produsului', err })
	}
}

export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { name, description, price, quantityInGrams, parentId, childId } =
			req.body
		const file = req.file as Express.Multer.File

		const product = await ProductModel.findById(req.params.id)
		const parentCategoryDoc = await CategoryModel.findById(parentId)
		const childCategoryDoc = await CategoryModel.findById(childId)

		const imageUrl = file ? `/images/${file.filename}` : product?.imageUrl
		const updatedProduct = await ProductModel.findByIdAndUpdate(
			req.params.id,
			{
				name,
				description,
				price,
				quantityInGrams,
				parentCategory: parentCategoryDoc
					? parentCategoryDoc._id
					: null,
				childCategory: childCategoryDoc ? childCategoryDoc._id : null,
				imageUrl,
			},
			{ new: true }
		)
			.select('-__v')
			.populate('parentCategory')
			.populate('childCategory')
		if (updatedProduct) {
			res.json(updatedProduct)
		} else {
			res.status(404).json({ message: 'Produsul nu a fost găsit' })
		}
	} catch (err) {
		console.log(err)
		res.status(500).json({
			error: 'Eroare la actualizarea produsului',
			err: err,
		})
	}
}

export const deleteProduct = async (req: IRequest, res: Response) => {
	try {
		const deletedProduct = await ProductModel.findByIdAndDelete(
			req.params.id
		)

		if (deletedProduct) {
			res.status(200).json({ message: 'Produs șters cu succes' })
		} else {
			res.status(404).json({ message: 'Produsul nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la ștergerea produsului' })
	}
}

export const toggleProductVisibility = async (req: IRequest, res: Response) => {
	try {
		const product = await ProductModel.findById(req.params.id)
		if (product) {
			const updatedProduct = await ProductModel.findByIdAndUpdate(
				req.params.id,
				{ isVisible: !product.isVisible },
				{ new: true }
			)
				.select('-__v')
				.populate('parentCategory')
				.populate('childCategory')
			res.status(200).json(updatedProduct)
		} else {
			res.status(404).json({ message: 'Produsul nu a fost găsit' })
		}
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la actualizarea produsului',
			err: err,
		})
	}
}
