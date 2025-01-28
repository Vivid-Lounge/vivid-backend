import { IRequest } from 'types'
import { Response } from 'express'
import CategoryModel from '../models/category.model'
import { Category } from 'shared/types'
export const createCategory = async (req: IRequest, res: Response) => {
	try {
		console.log('req.body', req.body)
		const categories = req.body.categories as Array<Category>
		console.log(categories, 'categories at backend at createCategory')
		await CategoryModel.deleteMany()
		const parentCategories = categories.filter(
			(category) => category.parent === null
		)
		const parentCats = parentCategories.map(async (parentCategory) => {
			return await CategoryModel.create({
				name: parentCategory.name,
				parent: null,
			})
		})
		const parents = await Promise.all(parentCats)
		const childrenCategories = categories.filter(
			(category) => category.parent !== null
		)

		console.log(parents, 'parents after await')
		const childrenCats = childrenCategories.map(async (childCategory) => {
			const parentId = parents.find(
				(parent) =>
					parent.name ===
					parentCategories.find(
						(parent) => parent._id === childCategory.parent
					)?.name
			)?._id
			console.log(parentId, 'parentId')
			return await CategoryModel.create({
				name: childCategory.name,
				parent: parentId,
			})
		})
		const auxCategories = await Promise.all([
			...parentCats,
			...childrenCats,
		])
		const actualCategories = auxCategories.map((category) =>
			category.toObject({ versionKey: false })
		)
		console.log(actualCategories)
		res.status(200).json(actualCategories)
	} catch (err) {
		console.log(err)
		res.status(500).json({ error: 'Eroare la crearea categoriei', err })
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
		const category = await CategoryModel.findById(req.params.id)
		if (category) {
			res.json(category)
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
