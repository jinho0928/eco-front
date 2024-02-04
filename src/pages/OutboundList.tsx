import DataGrid from "react-data-grid";
import { useEffect } from "react";
import { downloadExcel, parseOrderList, readFileAsArrayBuffer } from "../utils";
import { useLocalObservable, Observer } from "mobx-react";
import axios from "axios";
import { Button, styled } from "@mui/material";
import { DateTime } from "luxon";
import FileUploadButton from "../components/FileUploadButton";
import DownloadIcon from '@mui/icons-material/Download';

const columns = [
  { key: "no", name: "No.", width: 45, minWidth: 45 },
  { key: "customer", name: "거래처명", width: 110, minWidth: 110 },
  { key: "order_no", name: "발주번호", width: 85, minWidth: 85 },
  {
    key: "date",
    name: "입고예정일",
    width: 150,
    minWidth: 150,
    formatter({ column, row }) {
      return row[column.key];
    },
  },
  { key: "logistics", name: "물류센터", width: 80, minWidth: 80 },
  { key: "skuid", name: "상품코드", width: 85, minWidth: 85 },
  { key: "name", name: "상품명", minWidth: 300 },
  { key: "num", name: "아이템 No.", width: 90, minWidth: 90 },
  {
    key: "orderAmount",
    name: "발주수량",
    width: 90,
    minWidth: 90,
    formatter({ column, row }) {
      if (row["orderAmount"] !== row["availableAmount"])
        return <span className="cell--warning">{row[column.key]}</span>;

      return row[column.key];
    },
  },
  {
    key: "availableAmount",
    name: "업체납품 가능수량",
    width: 130,
    minWidth: 130,
    formatter({ column, row }) {
      if (row["orderAmount"] !== row["availableAmount"])
        return <span className="cell--warning">{row[column.key]}</span>;

      return row[column.key];
    },
  },
  { key: "pallet", name: "파레트", width: 70, minWidth: 70 },
  { key: "box", name: "박스", width: 70, minWidth: 70 },
];

const serverUrl = import.meta.env.VITE_SERVER_URL;

function calc(amount, pallet, box) {
  let _pallet = 0;
  let _box = 0;

  _pallet = amount / pallet >= 1 ? Math.floor(amount / pallet) : 0;
  _box = amount % pallet > 0 ? (amount % pallet) / box : 0;

  return { pallet: _pallet, box: _box };
}

function OutboundList() {
  const store = useLocalObservable(() => ({
    productMap: new Map(),
    items: [],

    setItems(items) {
      this.items = items;
    },

    fetchProducts() {
      axios.get(`${serverUrl}/products`).then(({ data }) => {
        const items = data.result ?? [];
        items.forEach((item) => store.productMap.set(item.skuid, item));
      });
    },
  }));

  useEffect(() => {
    store.fetchProducts();
  }, []);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const buffers = await Promise.all(
      Array.from(files).map((file) => readFileAsArrayBuffer(file))
    );

    // 엑셀에서 읽은 array of array
    const itemList = await Promise.all(
      buffers.map((arrayBuffer) => parseOrderList({ arrayBuffer }))
    );

    // array 펼쳐서 날짜순 정렬 후, 다시 array of array
    const groupedArray = itemList
      .flat()
      .sort(
        (a, b) =>
          DateTime.fromFormat(a.date, "yyyy-MM-dd") -
          DateTime.fromFormat(b.date, "yyyy-MM-dd")
      )
      .reduce((result, obj) => {
        const group = result.find(
          (arr) =>
            arr[0].logistics === obj.logistics && arr[0].date === obj.date
        );

        if (group) {
          group.push({ ...obj, no: group.length + 1 });
        } else {
          result.push([{ ...obj, no: 1 }]);
        }

        return result;
      }, []);

    const _itemList = groupedArray.map((list) => {
      const _list = list.map((_item) => {
        const item = store.productMap.get(_item.skuid + "");

        return {
          ..._item,
          num: item?.num,
          ...calc(_item.orderAmount, item?.qtypallet, item?.qtyset),
        };
      });

      const sumRow = _list.reduce(
        (acc, { pallet, box }) => {
          acc.pallet += pallet;
          acc.box += box;

          return acc;
        },
        {
          no: "합",
          pallet: 0,
          box: 0,
        }
      );
      return [..._list, sumRow];
    });

    store.setItems(_itemList.flat());
  };

  const handleDownload = () => {
    downloadExcel(store.items, columns, `출고리스트_${DateTime.now().toFormat('yy-MM-dd')}`);
  }

  return (
    <Wrapper>
      <div className="file-upload">
        <FileUploadButton title="발주서" onChange={handleFileChange} multiple />
        <Button
          component="label"
          variant="contained"
          startIcon={<DownloadIcon />}
          style={{ width: "150px", height: "40px" }}
          onClick={handleDownload}
        >엑셀 다운로드</Button>
      </div>

      <Observer>
        {() => (
          <DataGrid
            rows={store.items}
            columns={columns}
            defaultColumnOptions={{ resizable: true }}
            rowClass={(row) => (row.no === "합" ? "sum-row" : undefined)}
          />
        )}
      </Observer>
    </Wrapper>
  );
}

export default OutboundList;

const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding-bottom: 20px;
  gap: 10px;

  .file-upload {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  > .rdg {
    width: 100%;
    height: 100%;

    .rdg-cell {
      text-align: center;
    }

    .sum-row {
      background: rgb(255, 254, 226);
    }

    .cell--warning {
      color: red;
      font-weight: bold;
      font-size: 20px;
    }
  }
`;
