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

		// Fetch existing categories from the database
		const existingCategories = await CategoryModel.find().lean()

		// Arrays to track different operations
		const categoriesToUpdate: ICategory[] = []
		const categoriesToAdd: ICategory[] = []
		const categoriesToLeaveUnchanged: ICategory[] = []
		const categoriesToDelete: string[] = []

		// 1) Figure out which categories are updates vs. new vs. unchanged
		submittedCategories.forEach((submittedCategory) => {
			const existingCategory = existingCategories.find(
				(cat) => cat._id.toString() === submittedCategory._id
			)

			if (existingCategory) {
				// If category name or parent changed, schedule an update
				const parentIdAsString = existingCategory.parent
					? existingCategory.parent.toString()
					: null
				if (
					existingCategory.name !== submittedCategory.name ||
					parentIdAsString !== submittedCategory.parent
				) {
					categoriesToUpdate.push(submittedCategory)
				} else {
					categoriesToLeaveUnchanged.push(submittedCategory)
				}
			} else {
				// Not found in existing categories => new category
				categoriesToAdd.push(submittedCategory)
			}
		})

		// 2) Determine which existing categories are missing from submitted => delete
		existingCategories.forEach((existingCategory) => {
			const stillExists = submittedCategories.find(
				(submittedCategory) =>
					submittedCategory._id === existingCategory._id.toString()
			)
			if (!stillExists) {
				categoriesToDelete.push(existingCategory._id.toString())
			}
		})

		console.log(categoriesToUpdate, 'categoriesToUpdate')
		console.log(categoriesToAdd, 'categoriesToAdd')
		console.log(categoriesToLeaveUnchanged, 'categoriesToLeaveUnchanged')
		console.log(categoriesToDelete, 'categoriesToDelete')

		// 3) Update categories (name/parent changes only)
		const updatePromises = categoriesToUpdate.map((category) =>
			CategoryModel.findByIdAndUpdate(category._id, {
				name: category.name,
				parent: category.parent,
			})
		)

		// 4) Create new categories
		//    We need to handle both top-level categories (parent === null or invalid)
		//    and children that might point to existing parents or newly created parents.
		const creationPromises: Promise<any>[] = []
		if (categoriesToAdd.length > 0) {
			// A) First, find all categories that have no valid parent ID => treat them as "new parents"
			const newParents = categoriesToAdd.filter(
				(cat) =>
					!cat.parent ||
					!mongoose.Types.ObjectId.isValid(cat.parent.toString())
			)

			// B) Create these "new parent" categories
			const createdParentDocs = await Promise.all(
				newParents.map((cat) =>
					CategoryModel.create({
						name: cat.name,
						parent: null,
					})
				)
			)

			// C) Map the temporary (frontend) _id to the newly created _id
			const localIdMap: Record<string, string> = {}
			newParents.forEach((cat, idx) => {
				localIdMap[cat._id] = createdParentDocs[idx]._id.toString()
			})

			// D) Now create all other categories that remain to be added (children),
			//    including those that have an *existing* parent in the DB or a newly created parent.
			for (const cat of categoriesToAdd) {
				// If we already created it as a parent in step (B), skip
				if (localIdMap[cat._id]) {
					continue
				}

				let parentId: string | null = null

				// If cat.parent is a valid Mongo ObjectId, then the parent is an existing category
				if (
					cat.parent &&
					mongoose.Types.ObjectId.isValid(cat.parent.toString())
				) {
					parentId = cat.parent.toString()
				}
				// Otherwise, if cat.parent is one of our "new parents" we just created
				else if (cat.parent && localIdMap[cat.parent.toString()]) {
					parentId = localIdMap[cat.parent.toString()]
				}

				// Create the category
				creationPromises.push(
					CategoryModel.create({
						name: cat.name,
						parent: parentId,
					})
				)
			}
		}

		// 5) Delete categories that were removed
		const deletePromises = categoriesToDelete.map((id) =>
			CategoryModel.findByIdAndDelete(id)
		)

		// 6) Wait for all updates, creations, and deletions
		await Promise.all([
			...updatePromises,
			...creationPromises,
			...deletePromises,
		])

		// 7) Return the updated list of categories
		const updatedCategories = await CategoryModel.find().lean()
		res.status(200).json(updatedCategories)
	} catch (error) {
		console.log(error, 'error')
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
