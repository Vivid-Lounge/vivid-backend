import { IRequest } from 'types'
import { Response } from 'express'
import { Category } from 'shared/types'
import productModel from '../models/product.model'

import CategoryModel from '../models/category.model'
import { Request } from 'express'
interface ICategory {
	name: string
	parent: string | null
	_id: string
}
export const updateCategories = async (req: Request, res: Response) => {
	try {
		const submittedCategories = req.body.categories as Array<ICategory>

		console.log(submittedCategories, 'submittedCategories')

		// Fetch existing categories from the database
		const existingCategories = await CategoryModel.find().lean()

		// Determine categories to update, add, leave unchanged, and delete
		const categoriesToUpdate = [] as Array<ICategory>
		const categoriesToAdd = [] as Array<ICategory>
		const categoriesToLeaveUnchanged = [] as Array<ICategory>
		const categoriesToDelete = [] as string[]

		submittedCategories.forEach((submittedCategory) => {
			const existingCategory = existingCategories.find(
				(category) => category._id.toString() === submittedCategory._id
			)

			if (existingCategory) {
				if (
					existingCategory.name !== submittedCategory.name ||
					existingCategory.parent?.toString() !==
						submittedCategory.parent
				) {
					categoriesToUpdate.push(submittedCategory)
				} else {
					categoriesToLeaveUnchanged.push(submittedCategory)
				}
			} else {
				categoriesToAdd.push(submittedCategory)
			}
		})

		existingCategories.forEach((existingCategory) => {
			const isDeleted = !submittedCategories.find(
				(submittedCategory) =>
					submittedCategory._id === existingCategory._id.toString()
			)

			if (isDeleted) {
				categoriesToDelete.push(existingCategory._id)
			}
		})

		console.log(categoriesToUpdate, 'categoriesToUpdate')
		console.log(categoriesToAdd, 'categoriesToAdd')
		console.log(categoriesToLeaveUnchanged, 'categoriesToLeaveUnchanged')
		console.log(categoriesToDelete, 'categoriesToDelete')

		// Update categories
		const updatePromises = categoriesToUpdate.map((category) =>
			CategoryModel.findByIdAndUpdate(category._id, {
				name: category.name,
				parent: category.parent,
			})
		)

		// Add new categories
		const addPromises = categoriesToAdd.map((category) =>
			CategoryModel.create({
				name: category.name,
				parent: category.parent,
			})
		)

		// Delete removed categories
		const deletePromises = categoriesToDelete.map((id) =>
			CategoryModel.findByIdAndDelete(id)
		)

		// Wait for all updates, additions, and deletions to complete
		await Promise.all([
			...updatePromises,
			...addPromises,
			...deletePromises,
		])

		// Fetch the updated list of categories
		const updatedCategories = await CategoryModel.find().lean()
		res.status(200).json(updatedCategories)
	} catch (error) {
		res.status(500).json({
			error: 'Error updating categories',
			stack: error,
		})
	}
}

export const getCategories = async (req: IRequest, res: Response) => {
	try {
		const categories = await CategoryModel.find()
		const actualCategories = categories.map((category) =>
			category.toObject({ versionKey: false })
		)
		res.json(actualCategories)
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea categoriilor' })
	}
}

export const getCategory = async (req: IRequest, res: Response) => {
	try {
		console.log('getCategorydwwwwwwwwwwwww', req.params.id)
		const category = await CategoryModel.findById(req.params.id)
		let products
		if (category && category.parent === null) {
			products = await productModel
				.find({ parentCategory: category._id })
				.select('-__v')
				.populate('parentCategory')
				.populate('childCategory')
		} else if (category && category.parent !== null) {
			products = await productModel
				.find({ childCategory: category._id })
				.select('-__v')
				.populate('parentCategory')
				.populate('childCategory')
		}
		console.log('products', products)
		if (category && products) {
			res.status(200).json(products)
		} else {
			res.status(404).json({ message: 'Categoria nu a fost găsită' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la obținerea categoriei' })
	}
}

export const updateCategory = async (req: IRequest, res: Response) => {
	try {
		const { name } = req.body
		const category = await CategoryModel.findOneAndUpdate(
			{ name },
			{ name },
			{ new: true }
		)

		if (!category) {
			return res.status(404).json({ error: 'Categoria nu a fost gasit.' })
		}
		res.status(200).json(category)
	} catch (err) {
		res.status(500).json({
			error: 'Eroare la actualizarea categoriei',
			err,
		})
	}
}

export const deleteCategory = async (req: IRequest, res: Response) => {
	try {
		const category = await CategoryModel.findByIdAndDelete(req.params.id)
		if (category) {
			res.status(200).json(category)
		} else {
			res.status(404).json({ message: 'Categoria nu a fost găsită' })
		}
	} catch (err) {
		res.status(500).json({ error: 'Eroare la ștergerea categoriei' })
	}
}
