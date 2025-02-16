import { IRequest } from 'types'
import { Response } from 'express'
import { Category } from 'shared/types'
import productModel from '../models/product.model'

import CategoryModel from '../models/category.model'
import { Request } from 'express'
import mongoose from 'mongoose'
interface ICategory {
	name: string
	parent: string | null | mongoose.Schema.Types.ObjectId
	_id: string
} // adjust import path
export const updateCategories = async (req: Request, res: Response) => {
	try {
		const submittedCategories = req.body.categories as Array<ICategory>
		console.log(submittedCategories, 'submittedCategories')

		// 1) Fetch existing categories
		const existingCategories = await CategoryModel.find().lean()

		// 2) Classify into update / add / unchanged / delete
		const categoriesToUpdate: ICategory[] = []
		const categoriesToAdd: ICategory[] = []
		const categoriesToLeaveUnchanged: ICategory[] = []
		const categoriesToDelete: string[] = []

		// Figure out updates vs. new vs. unchanged
		submittedCategories.forEach((submittedCat) => {
			const existingCat = existingCategories.find(
				(ex) => ex._id.toString() === submittedCat._id
			)
			if (existingCat) {
				const parentIdAsString = existingCat.parent
					? existingCat.parent.toString()
					: null
				if (
					existingCat.name !== submittedCat.name ||
					parentIdAsString !== submittedCat.parent
				) {
					categoriesToUpdate.push(submittedCat)
				} else {
					categoriesToLeaveUnchanged.push(submittedCat)
				}
			} else {
				categoriesToAdd.push(submittedCat)
			}
		})

		// Figure out which existing ones to delete
		existingCategories.forEach((ex) => {
			const stillExists = submittedCategories.find(
				(sub) => sub._id === ex._id.toString()
			)
			if (!stillExists) {
				categoriesToDelete.push(ex._id.toString())
			}
		})

		console.log({
			categoriesToUpdate,
			categoriesToAdd,
			categoriesToLeaveUnchanged,
			categoriesToDelete,
		})

		// 3) Update changed categories
		const updatePromises = categoriesToUpdate.map((cat) =>
			CategoryModel.findByIdAndUpdate(cat._id, {
				name: cat.name,
				parent: cat.parent,
			})
		)

		// 4) Create new categories (two-level approach)
		const creationPromises: Promise<any>[] = []
		if (categoriesToAdd.length > 0) {
			// A) Top-level new categories
			const topLevel = categoriesToAdd.filter(
				(cat) => cat.parent === null
			)
			const children = categoriesToAdd.filter(
				(cat) => cat.parent !== null
			)

			// B) Create top-level
			const createdParentDocs = await Promise.all(
				topLevel.map((cat) =>
					CategoryModel.create({
						name: cat.name,
						parent: null,
					})
				)
			)

			// C) Map local ID → real ID
			const localIdMap: Record<string, string> = {}
			topLevel.forEach((cat, idx) => {
				localIdMap[cat._id] = createdParentDocs[idx]._id.toString()
			})

			// D) Create children
			for (const cat of children) {
				let parentId: string | null = null

				if (
					cat.parent &&
					mongoose.Types.ObjectId.isValid(cat.parent.toString())
				) {
					// references an existing category
					const parentString = cat.parent.toString()
					parentId = parentString || null
				} else if (cat.parent && localIdMap[cat.parent.toString()]) {
					// references a newly created parent
					parentId = localIdMap[cat.parent.toString()]
				}

				creationPromises.push(
					CategoryModel.create({
						name: cat.name,
						parent: parentId,
					})
				)
			}
		}

		// 5) Delete removed categories
		const deletePromises = categoriesToDelete.map((id) =>
			CategoryModel.findByIdAndDelete(id)
		)

		// 6) Await everything
		await Promise.all([
			...updatePromises,
			...creationPromises,
			...deletePromises,
		])

		// 7) Fetch updated list
		const updatedCategories = await CategoryModel.find().lean()
		res.status(200).json(updatedCategories)
	} catch (error) {
		console.error(error)
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
