import { Router } from 'express';
import 
{
    getGallery,
    insertImages,
    deleteImage,
    updateGallery,
} from '../controllers/gallery.controller'
import { setupGalleryDirectory } from '../workers/setupUploadDir'
import { body } from 'express-validator'
import multer from 'multer'
import { authMiddleware } from '../workers/middlewares'

const uploadDir = setupGalleryDirectory()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.fieldname === 'images'
        ) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    },
}) 
const router = Router()

router.get('/gallery', getGallery)
router.post('/gallery', 
    authMiddleware, 
    upload.fields([
        {
            name: 'images',
            maxCount: 32,
        }
    ]),
    insertImages)
router.put('/gallery', authMiddleware, updateGallery)
router.put('/deleteImage', authMiddleware, deleteImage);

export default router