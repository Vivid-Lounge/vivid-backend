"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminMiddleware = void 0;
const isAdminMiddleware = (req, res, next) => {
    console.log(req.user, 'dwdwdw');
    if (req.user && req.user.role === 0) {
        next();
    }
    else {
        res.status(401);
        throw new Error('Unauthorized');
    }
};
exports.isAdminMiddleware = isAdminMiddleware;
