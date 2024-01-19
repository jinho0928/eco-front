export function isNumeric(value) {
    return /^\d+$/.test(value);
}

export function customSort(a, b, sortColumn) {
    const valueA = a[sortColumn.columnKey] ?? "";
    const valueB = b[sortColumn.columnKey] ?? "";

    const isNumberA = isNumeric(valueA);
    const isNumberB = isNumeric(valueB);

    if (isNumberA && isNumberB) {
        // 둘 다 숫자인 경우 숫자로 정렬
        return sortColumn.direction === 'ASC' ? parseInt(valueA, 10) - parseInt(valueB, 10) : parseInt(valueB, 10) - parseInt(valueA, 10);
    } else if (isNumberA) {
        // A만 숫자인 경우 A를 먼저 정렬
        return sortColumn.direction === 'ASC' ? -1 : 1;
    } else if (isNumberB) {
        // B만 숫자인 경우 B를 먼저 정렬
        return sortColumn.direction === 'ASC' ? 1 : -1;
    } else {
        // 둘 다 문자인 경우 문자열 비교
        return sortColumn.direction === 'ASC' ? valueA > valueB ? 1 : -1 : valueA < valueB ? 1 : -1;
    }
}