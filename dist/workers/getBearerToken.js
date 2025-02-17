"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBearerToken = void 0;
const getBearerToken = (req) => {
    if (req.headers.authorization) {
        return req.headers.authorization.split(' ')[1].toString();
    }
    else {
        return null;
    }
};
exports.getBearerToken = getBearerToken;
