import mongoose from "mongoose";
import { Image } from '../shared/types/Image';

export const imageScheme = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    priority: { type: Number, default: 0 },
})

export default mongoose.model<Image>('Image', imageScheme)
