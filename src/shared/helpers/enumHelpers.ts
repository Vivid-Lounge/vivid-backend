export const getNumericEnumValues = (enumObject: any) => {
	return Object.keys(enumObject)
		.filter((key) => !isNaN(Number(enumObject[key])))
		.map((key) => Number(enumObject[key]))
}

export const getStringEnumValues = (enumObject: any) => {
	return Object.keys(enumObject)
		.filter((key) => isNaN(Number(enumObject[key])))
		.map((key) => enumObject[key])
}

export const getEnumValueByKey = (enumObject: any, key: string) => {
	return Object.keys(enumObject)
		.filter((enumKey) => enumKey === key)
		.map((enumKey) => enumObject[enumKey])[0]
}
