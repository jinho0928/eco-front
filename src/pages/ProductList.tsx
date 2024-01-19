import DataGrid from "react-data-grid";
import { useEffect } from "react";
import { useLocalObservable, Observer } from "mobx-react";
import axios from "axios";
import { Button, ListItem, styled } from "@mui/material";
import { ProductCreateDialog } from "../components/ProductCreateDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const columns = [
  { key: "skuid", name: "SKU ID", width: 100, minWidth: 100 },
  { key: "num", name: "No.", width: 60, minWidth: 60 },
  { key: "name", name: "상품명", width: 500, minWidth: 500 },
  { key: "qtyset", name: "QTY Set", width: 100, minWidth: 100 },
  { key: "qtypallet", name: "QTY Pallet", width: 100, minWidth: 100 },
];

const serverUrl = import.meta.env.VITE_SERVER_URL;

function ProductList() {
  const store = useLocalObservable(() => ({
    // dialog
    isOpen: false,

    items: [],
    sortColumns: null,

    get sortedItems() {
      const sortColumn = this.sortColumns?.[0] ?? null;
      if (sortColumn) {
        return this.items.slice().sort((a, b) => {
          const valueA = a[sortColumn.columnKey];
          const valueB = b[sortColumn.columnKey];
          function extractNumber(str) {
            // 숫자가 아닌 문자를 제거하여 숫자만 추출
            return parseInt(str.replace(/\D/g, ""), 10) || 0;
          }

          function isNumeric(str) {
            // 숫자인지 여부 확인
            return !isNaN(parseFloat(str)) && isFinite(str);
          }

          // "L"을 포함한 숫자로 비교
          const numA = isNumeric(valueA)
            ? extractNumber(valueA)
            : parseFloat(valueA);
          const numB = isNumeric(valueB)
            ? extractNumber(valueB)
            : parseFloat(valueB);

          // 정렬 방향에 따라 비교
          if (sortColumn.direction === "ASC") {
            return isNumeric(valueA) && isNumeric(valueB)
              ? numA - numB
              : valueA.localeCompare(valueB);
          } else if (sortColumn.direction === "DESC") {
            return isNumeric(valueA) && isNumeric(valueB)
              ? numB - numA
              : valueB.localeCompare(valueA);
          } else {
            // 정렬 방향이 지정되지 않은 경우, 기본적으로 오름차순 정렬
            return isNumeric(valueA) && isNumeric(valueB)
              ? numA - numB
              : valueA.localeCompare(valueB);
          }
        });
      } else {
        return this.items;
      }
    },

    setItems(items) {
      this.items = items;
    },

    fetchProducts() {
      axios.get(`${serverUrl}/products`).then(({ data }) => {
        const items = data.result ?? [];
        this.setItems(items);
      });
    },
  }));

  useEffect(() => {
    store.fetchProducts();
  }, []);

  return (
    <Wrapper>
      <div className="products-header">
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          style={{ width: "150px", height: "40px" }}
          onClick={() => (store.isOpen = true)}
        >
          상품 추가
        </Button>
      </div>
      <Observer>
        {() => (
          <ProductCreateDialog
            open={store.isOpen}
            onClose={(isCreated: boolean | undefined) => {
              if (isCreated) store.fetchProducts();
              store.isOpen = false;
            }}
          />
        )}
      </Observer>
      <Observer>
        {() => (
          <DataGrid
            rows={store.sortedItems}
            columns={columns}
            defaultColumnOptions={{ resizable: true, sortable: true }}
            sortColumns={store.sortColumns}
            onSortColumnsChange={(columns) => (store.sortColumns = columns)}
          />
        )}
      </Observer>
    </Wrapper>
  );
}

export default ProductList;

const Wrapper = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding-bottom: 20px;
  gap: 10px;

  > .rdg {
    width: 100%;
    height: 100%;

    .rdg-cell {
      text-align: center;
    }
  }

  .products-header {
    display: flex;
    justify-content: flex-end;
  }
`;
