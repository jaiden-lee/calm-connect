export function stringOrFirstString(item: string | string[] | undefined) {
    return Array.isArray(item) ? item[0] : item
}  