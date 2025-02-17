"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvents = exports.updateEvent = exports.createEvent = exports.getEvent = exports.getEvents = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const mongoose_1 = __importDefault(require("mongoose"));
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield event_model_1.default.find();
        res.json(events);
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la preluarea evenimentelor',
            stack: err,
        });
    }
});
exports.getEvents = getEvents;
const getEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        let event;
        if (mongoose_1.default.Types.ObjectId.isValid(slug)) {
            event = yield event_model_1.default.findById(slug);
        }
        else {
            event = yield event_model_1.default.findOne({ slug });
        }
        if (event) {
            res.json(event);
        }
        else {
            res.status(404).json({ message: 'Evenimentul nu a fost găsit' });
        }
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la preluarea evenimentului',
            stack: err,
        });
    }
});
exports.getEvent = getEvent;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, phone, date, ticketsLink, description } = req.body;
        console.log(req.body);
        console.log(req.files, 'req.files');
        const files = req.files;
        const slug = title ? title.toLowerCase().replace(/ /g, '-') : date;
        const posterImagePath = path_1.default.join(__dirname, `../../public/images/${files.posterImage[0].originalname}`);
        yield promises_1.default.writeFile(posterImagePath, files.posterImage[0].buffer);
        const coverImagePath = path_1.default.join(__dirname, `../../public/images/${files.coverImage[0].originalname}`);
        yield promises_1.default.writeFile(coverImagePath, files.coverImage[0].buffer);
        const posterImage = `/images/${files.posterImage[0].originalname}`;
        const coverImage = `/images/${files.coverImage[0].originalname}`;
        const newEvent = new event_model_1.default({
            title,
            posterImage,
            coverImage,
            date,
            phone,
            ticketsLink,
            description,
            slug,
        });
        const savedEvent = yield newEvent.save();
        console.log(savedEvent);
        res.status(200).json(savedEvent.toObject({ versionKey: false }));
    }
    catch (err) {
        res.status(500).json({ error: 'Eroare la crearea evenimentului', err });
    }
});
exports.createEvent = createEvent;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, phone, date, ticketsLink, description } = req.body;
        const files = req.files;
        const event = yield event_model_1.default.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // Delete old images if they exist and new ones are uploaded
        if (files.posterImage && event.posterImage) {
            const oldPosterPath = event.posterImage.split('/').pop(); // Get filename from URL
            if (oldPosterPath) {
                const fullOldPosterPath = path_1.default.join(process.cwd(), 'public', 'images', oldPosterPath);
                if (fs_1.default.existsSync(fullOldPosterPath)) {
                    fs_1.default.unlinkSync(fullOldPosterPath);
                }
            }
        }
        if (files.coverImage && event.coverImage) {
            const oldCoverPath = event.coverImage.split('/').pop();
            if (oldCoverPath) {
                const fullOldCoverPath = path_1.default.join(process.cwd(), 'public', 'images', oldCoverPath);
                if (fs_1.default.existsSync(fullOldCoverPath)) {
                    fs_1.default.unlinkSync(fullOldCoverPath);
                }
            }
        }
        // Update event with new data
        event.title = title;
        event.phone = phone;
        event.date = date;
        event.ticketsLink = ticketsLink;
        event.description = description;
        event.slug = title ? title.toLowerCase().replace(/ /g, '-') : date;
        // Update image paths if new files uploaded
        if (files.posterImage) {
            const posterImagePath = path_1.default.join(__dirname, `../../public/images/${files.posterImage[0].originalname}`);
            yield promises_1.default.writeFile(posterImagePath, files.posterImage[0].buffer);
            event.posterImage = `/images/${files.posterImage[0].originalname}`;
        }
        if (files.coverImage) {
            const coverImagePath = path_1.default.join(__dirname, `../../public/images/${files.coverImage[0].originalname}`);
            yield promises_1.default.writeFile(coverImagePath, files.coverImage[0].buffer);
            event.coverImage = `/images/${files.coverImage[0].originalname}`;
        }
        const updatedEvent = yield event.save();
        res.status(200).json(updatedEvent.toObject({ versionKey: false }));
    }
    catch (err) {
        res.status(500).json({
            error: 'Error updating event',
            stack: err,
        });
    }
});
exports.updateEvent = updateEvent;
const deleteEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = req.body.ids;
        console.log(req.body);
        console.log(ids);
        const foundEvents = yield event_model_1.default.find({ _id: { $in: ids } });
        const result = yield event_model_1.default.deleteMany({ _id: { $in: ids } });
        console.log(result);
        foundEvents.forEach((e) => {
            console.log(`../../public${e.posterImage}`);
            if (fs_1.default.existsSync(path_1.default.join(__dirname, `../../public/${e === null || e === void 0 ? void 0 : e.posterImage}`))) {
                fs_1.default.unlinkSync(path_1.default.join(__dirname, `../../public/${e === null || e === void 0 ? void 0 : e.posterImage}`));
            }
            if (fs_1.default.existsSync(path_1.default.join(__dirname, `../../public/${e === null || e === void 0 ? void 0 : e.coverImage}`))) {
                fs_1.default.unlinkSync(path_1.default.join(__dirname, `../../public/${e === null || e === void 0 ? void 0 : e.coverImage}`));
            }
        });
        res.status(200).json({
            message: `${result.deletedCount} events deleted successfully`,
            deletedCount: result.deletedCount,
        });
    }
    catch (err) {
        res.status(500).json({
            error: 'Eroare la ștergerea evenimentului',
            stack: err,
        });
    }
});
exports.deleteEvents = deleteEvents;
