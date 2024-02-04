import { Button, isMuiElement, styled } from "@mui/material";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import axios from "axios";
import { Observer, useLocalObservable } from "mobx-react";
import "react-data-grid/lib/styles.css";
import { autorun, transaction, values } from "mobx";
import EditIcon from "@mui/icons-material/Edit";
import { Filter } from "../components/Filter";
import { customSort } from "../utils/sort";
import FileUploadButton from "../components/FileUploadButton";
import { FactoryOrder } from "../components/FactoryOrder";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadExcel } from "../utils";
import { DateTime } from "luxon";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const columns = [
  { key: "num", name: "No.", width: 45, minWidth: 45 },
  { key: "skuid", name: "SKU ID", width: 85, minWidth: 85 },
  { key: "name", name: "상품명", minWidth: 300, width: 400 },
  {
    key: "stock", name: "총 창고 재고", width: 100, minWidth: 100, formatter({ column, row }) {
      const value = row[column.key];
      const isMinus = parseInt(value, 10) < 0
      console.log(value, isMinus)
      return <span className={isMinus ? 'cell--warning' : ''}>{value}</span>
    }
  },
  { key: "factory_value", name: "공장 재고", width: 85, minWidth: 85 },
  { key: "factory_stock_day", name: "창고 재고(일)", width: 110, minWidth: 110 },
  { key: "warehouse_stock_day", name: "공장 재고(일)", width: 110, minWidth: 110 },
  { key: "total_stock_day", name: "총 재고(일)", width: 110, minWidth: 110 },
  { key: "stock_date", name: "평균판매량", width: 110, minWidth: 110 },
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
    isOpen: false,
    files: [],
    fetchInventories() {
      axios.get(`${serverUrl}/inventories`).then(({ data }) => {
        this.items = data.result.map((item) => ({
          ...item,
          stock : item.stock,
          factory_value : item.factory_value,
          factory_stock_day : item.factory_stock_day,
          warehouse_stock_day : item.warehouse_stock_day,
          total_stock_day :  item.total_stock_day,
          stock_date : item.stock_date,
        }));
      });
    },
  }));

  useEffect(() => {
    store.fetchInventories();
  }, []);

  const handleFileChange = (e) => {
      transaction(() => {
          store.files = e.target.files;
          store.isOpen = true;
      });
  };

  const handleClose = () => {
      transaction(() => {
          store.files = [];
          store.isOpen = false;
      });
  };

  const handleDownload = () => {
    downloadExcel(store.sortedItems, columns, `재고_${DateTime.now().toFormat('yy-MM-dd')}`);
  }

  return (
    <Wrapper>
      <div className="inventory-header">
        <Button
          component="label"
          variant="contained"
          startIcon={<DownloadIcon />}
          style={{ width: "150px", height: "40px" }}
          onClick={handleDownload}
        >엑셀 다운로드</Button>
      </div>

      <Observer>
        {() =>
          store.isOpen && (
            <FactoryOrder
              open={store.isOpen}
              onClose={handleClose}
              files={store.files}
              onSuccess={() => {
                transaction(() => {
                  store.isOpen = false;
                  store.fetchInventories()
                })
              }
              }
            />
          )
        }
      </Observer>

      <Observer>
        {() => (
            <FileUploadButton
              title="공장주문서"
              onChange={handleFileChange}
              multiple
            />
        )}
      </Observer>

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
/*
  return (
    <Wrapper>
      <Observer>
        {() => (
        <FileUploadButton
           title="공장주문"
           onChange={handleFileChange}
        </Filter>
        )}
      </Observer>
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
  );*/
}

export default Inventory;

const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding-bottom: 20px;
  gap: 10px;

  .inventory-header {
    display: flex;
    justify-content: flex-end;
  }

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
