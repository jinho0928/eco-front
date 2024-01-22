import { isMuiElement, styled } from "@mui/material";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import axios from "axios";
import { Observer, useLocalObservable } from "mobx-react";
import "react-data-grid/lib/styles.css";
import { customSort } from "../utils/sort";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const columns = [
  { key: "num", name: "No.", width: 45, minWidth: 45 },
  { key: "skuid", name: "SKU ID", width: 85, minWidth: 85 },
  { key: "name", name: "상품명", minWidth: 300, width: 400 },
  {
    key: "value_difference", name: "총 창고 재고", width: 100, minWidth: 100, formatter({ column, row }) {
      const value = row[column.key];
      const isMinus = parseInt(value, 10) < 0
      console.log(value, isMinus)
      return <span className={isMinus ? 'cell--warning' : ''}>{value}</span>
    }
  },
  { key: "공장 재고", name: "공장 재고", width: 85, minWidth: 85 },
  { key: "factory_stock_day", name: "창고 재고(일)", width: 110, minWidth: 110 },
  { key: "공장재고(일)", name: "공장 재고(일)", width: 110, minWidth: 110 },
  { key: "총 재고(일)", name: "총 재고(일)", width: 110, minWidth: 110 },
];

function Inventory() {
  const store = useLocalObservable(() => ({
    // data
    items: [],
    sortColumns: null,

    get sortedItems() {
      const sortColumn = this.sortColumns?.[0] ?? null;
      if (sortColumn) {
        return this.items.slice().sort((a, b) => customSort(a, b, sortColumn));
      } else {
        return this.items;
      }
    },


    fetchInventories() {
      axios.get(`${serverUrl}/inventories`).then(({ data }) => {
        this.items = data.result.map((item) => ({
          ...item,
          제1창고: item.value_difference,
          총창고재고: item.value_difference,
          // 컨테이너: 0,
          // 공장: 0,
          // 총입고예정재고: 0,
          // 창고재고: 0,
          // 입고예정재고: 0,
          // 총재고일수: 0,
          // 발주여부: 0,
        }));
      });
    },
  }));

  useEffect(() => {
    store.fetchInventories();
  }, []);

  return (
    <Wrapper>
      <Observer>
        {() => (
          <DataGrid
            rows={store.sortedItems}
            defaultColumnOptions={{ resizable: true, sortable: true }}
            sortColumns={store.sortColumns}
            onSortColumnsChange={(columns) => (store.sortColumns = columns)}
            columns={columns}
          />
        )}
      </Observer>
    </Wrapper>
  );
}

export default Inventory;

const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding-bottom: 20px;

  > .rdg {
    width: 100%;
    height: 100%;

    .rdg-cell {
      text-align: center;
    }

    .cell--warning{
      color: red;
      font-weight: bold;
      font-size: 20px;
    }
  

    .hover-cell {
      > .edit-button {
        visibility: visible;
      }

      &:hover {
        > .edit-button {
          visibility: visible;
        }
      }
    }
  }
`;
