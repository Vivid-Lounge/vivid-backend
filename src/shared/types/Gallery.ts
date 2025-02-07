import mongoose from "mongoose";
import { Image } from "./Image";

export interface Gallery extends Document {
  imageArray: Image[];
  _id: mongoose.Types.ObjectId;
}