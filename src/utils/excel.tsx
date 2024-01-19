import * as XLSX from "xlsx";
import { DateTime } from "luxon";

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
  const orderNo = rows.find((row) => /발주번호/gi.test(row?.[0]))[1];

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
          orderNo,
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