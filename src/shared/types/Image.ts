import mongoose from "mongoose";

export interface Image extends Document {
    imageUrl: string;
    priority: number;
    _id: mongoose.Types.ObjectId;
 
}