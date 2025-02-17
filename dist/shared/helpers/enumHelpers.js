"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnumValueByKey = exports.getStringEnumValues = exports.getNumericEnumValues = void 0;
const getNumericEnumValues = (enumObject) => {
    return Object.keys(enumObject)
        .filter((key) => !isNaN(Number(enumObject[key])))
        .map((key) => Number(enumObject[key]));
};
exports.getNumericEnumValues = getNumericEnumValues;
const getStringEnumValues = (enumObject) => {
    return Object.keys(enumObject)
        .filter((key) => isNaN(Number(enumObject[key])))
        .map((key) => enumObject[key]);
};
exports.getStringEnumValues = getStringEnumValues;
const getEnumValueByKey = (enumObject, key) => {
    return Object.keys(enumObject)
        .filter((enumKey) => enumKey === key)
        .map((enumKey) => enumObject[enumKey])[0];
};
exports.getEnumValueByKey = getEnumValueByKey;
