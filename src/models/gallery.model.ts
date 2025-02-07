import mongoose, { mongo } from 'mongoose';
import { Gallery } from '../shared/types/Gallery';
import { imageScheme } from './image.model';

const gallerySchema = new mongoose.Schema({
    imageArray: {
        type: [imageScheme],
        default: [],
        required: true,
      },
})

export default mongoose.model<Gallery>('Gallery', gallerySchema)