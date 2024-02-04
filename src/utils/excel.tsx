import * as XLSX from "xlsx";
import { DateTime } from "luxon";
import { toJS } from "mobx";

export async function parseOrderList({ arrayBuffer }): Promise<any> {
  const book = XLSX.read(arrayBuffer, {
    type: "buffer",
  });

  const sheetName = book.SheetNames[0];
  const sheet = book.Sheets[sheetName];

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  const _columns = Array.from({ length: range.e.c + 1 }, (_, i) => ({
    key: String(i),
    name: XLSX.utils.encode_col(i),
  }));

  const rows: any[] = XLSX.utils
    .sheet_to_json(sheet, {
      header: _columns.map(({ key }) => key),
      range,
    })
    .map((row) => Object.values(row));

  // 거래처명
  const customer = rows
    .find((row) => /거래처명/gi.test(row?.[0]))[1]
    .split("_")[1]
    .split("(")[0];

  // 발주번호
  const order_no = rows.find((row) => /발주번호/gi.test(row?.[0]))[1];

  // 입고예정일, 물류센터
  const inbound =
    rows[rows.findIndex((row) => /입고예정일시/gi.test(row?.[0])) + 1];
  const logistics = inbound[0];
  const date = DateTime.fromFormat(
    inbound[2].split(" ")[0],
    "yyyy/MM/dd"
  ).toFormat("yyyy-MM-dd");

  // 상품정보 리스트
  const startIndex = rows.findIndex((row) => /상품정보/gi.test(row?.[0]));
  const endIndex = rows.findIndex((row) => /합계/gi.test(row?.[0]));
  // TODO: 발주서에 item no이 없음. 이부분 수정
  const items = rows
    .slice(startIndex + 3, endIndex)
    .reduce((acc, item, idx) => {
      if (idx % 2 === 0) {
        acc.push({
          skuid: `${item[1]}`,
          name: `${item[2]}`,
          orderAmount: `${item[6]}`,
          availableAmount: `${item[7]}`,
          customer,
          order_no,
          date,
          logistics,
        });
      }
      return acc;
    }, []);

  return items;
}

export async function parsePackingList({ arrayBuffer }): Promise<any> {
  const book = XLSX.read(arrayBuffer, {
    type: "buffer",
  });

  const sheetName = book.SheetNames[0];
  const sheet = book.Sheets[sheetName];

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  const _columns = Array.from({ length: range.e.c + 1 }, (_, i) => ({
    key: String(i),
    name: XLSX.utils.encode_col(i),
  }));

  const rows: any[] = XLSX.utils
    .sheet_to_json(sheet, {
      header: _columns.map(({ key }) => key),
      range,
    })
    .map((row) => Object.values(row));

  // 날짜
  const date = rows[0][0];

  // 상품정보 리스트
  const startIndex = rows.findIndex((row) => /container no/gi.test(row?.[0]));
  const endIndex = rows.findIndex((row) => /all total/gi.test(row?.[0]));
  const items = rows.slice(startIndex + 1, endIndex).reduce((acc, item) => {
    acc.push({
      skuid: item[1],
      description: item[2],
      value: item[6],
    });

    return acc;
  }, []);

  return { items, date };
}

export async function parseTrend({ arrayBuffer }): Promise<any> {
  const book = XLSX.read(arrayBuffer, {
    type: "buffer",
  });

  const sheetName = book.SheetNames[0];
  const sheet = book.Sheets[sheetName];

  const _rows: any[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  });

  const _keys = {
    0: "skuid",
    1: "inventory",
  };

  const keys = _rows[0].map(
    (key, index) =>
      _keys[index] ?? DateTime.fromJSDate(new Date(key)).toFormat("yy/MM/dd")
  );

  const rows = _rows.slice(1).map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[keys[index]] = cur;
      return acc;
    }, {});
  });

  return { rows, keys };
}

export async function parseFactoryOrder({ arrayBuffer }): Promise<any> {
  const book = XLSX.read(arrayBuffer, {
    type: "buffer",
  });

  const sheetName = book.SheetNames[0];
  const sheet = book.Sheets[sheetName];

  const _rows: any[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  });

  const _keys = {
    2: "num",
    13: "value",
  };

  const rows = _rows.slice(1).map((row) => {
    return row.reduce((acc, cur, index) => {
      acc[_keys[index]] = cur;
      return acc;
    }, {});
  });

  console.info('parseFactoryOrder parseFactoryOrder parseFactoryOrder parseFactoryOrder parseFactoryOrder');

  return { rows, _keys };
}

export async function readFileAsArrayBuffer(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      resolve(arrayBuffer);
    };

    reader.readAsArrayBuffer(file);
  });
}

export function downloadExcel(rows, columns, filename) {
  const _rows = toJS(rows);
  const _columns = toJS(columns);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(_rows, { header: _columns.map(({ key }) => key) })
  XLSX.utils.sheet_add_aoa(ws, [_columns.map(({ name }) => name)], { origin: "A1" });

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
