import DataGrid from "react-data-grid";
import { useEffect } from "react";
import { useLocalObservable, Observer } from "mobx-react";
import axios from "axios";
import { Button, styled } from "@mui/material";
import { ProductCreateDialog } from "../components/ProductCreateDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { customSort } from "../utils/sort";
import { transaction } from "mobx";

const columns = [
  { key: "num", name: "No.", width: 60, minWidth: 60 },
  { key: "skuid", name: "SKU ID", width: 100, minWidth: 100 },
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
        return this.items.slice().sort((a, b) => customSort(a, b, sortColumn));
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
            onClose={() => {
              store.isOpen = false;
            }}
            onSuccess={() => {
              transaction(() => {
                store.isOpen = false;
                store.fetchProducts();
              })

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
