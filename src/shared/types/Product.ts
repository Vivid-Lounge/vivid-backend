export interface Product extends Document {
	name: string
	description: string
	price: number
	quantityInGrams: number
	imageUrl: string
}
