export function IntegerFormatter(props) {
  const { column, row } = props;

  let value = row[column.key] ?? "";
  if (value && typeof value === "number" && !isNaN(value)) {
    value = Math.round(value);
  }

  return value;
}

export function DecimalFormatter(props) {
  const { column, row, precision } = props;

  let value = row[column.key] ?? "";
  if (value && typeof value === "number" && !isNaN(value)) {
    value = parseFloat(value.toFixed(precision));
  }

  return value;
}
