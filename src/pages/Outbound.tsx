import {
  Button,
  Dialog,
  IconButton,
  Input,
  Tooltip,
  styled,
} from "@mui/material";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import axios from "axios";
import { DateTime } from "luxon";
import { Observer, useLocalObservable } from "mobx-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import "react-data-grid/lib/styles.css";
import { autorun, toJS, transaction } from "mobx";
import EditIcon from "@mui/icons-material/Edit";
import { parseOrderList, readFileAsArrayBuffer } from "../utils";
import { OrderListDialog } from "../components/OrderListDialog";
import { Filter } from "../components/Filter";
import FileUploadButton from "../components/FileUploadButton";
import { customSort, isNumeric } from "../utils/sort";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { DeleteOrderNoDialog } from "../components/DeleteOrderNoDialog";

const serverUrl = import.meta.env.VITE_SERVER_URL;

function Outbound() {
  const today = DateTime.now();
  const oneMonthAgo = today.minus({ months: 1 });

  const store = useLocalObservable(() => ({
    // filter
    start: oneMonthAgo,
    end: today,

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

    isDeleteOpen: false,
    orderNo: '',

    fetchOutbound(start, end, order_no?) {
      let url = `${serverUrl}/outbounds?start=${start}&end=${end}`
      if (order_no) url += `&order_no=${order_no}`
      axios
        .get(url)
        .then(({ data }) => {
          this.items = data.result;
        });
    },

    updateOutbound(skuid, date, value) {
      axios
        .put(`${serverUrl}/outbounds/${skuid}`, { date, value })
        .then(({ data }) => {
          this.fetchOutbound(
            this.start.toFormat("yyyy-MM-dd"),
            this.end.toFormat("yyyy-MM-dd")
          );
        });
    },

    addOutbound(skuid, date, value, order_no) {
      const list = [{ skuid, date, value, ordeNor: order_no ?? "" }];

      axios
        .post(`${serverUrl}/outbounds`, {
          list,
        })
        .then(({ data }) => {
          this.fetchOutbound(
            this.start.toFormat("yyyy-MM-dd"),
            this.end.toFormat("yyyy-MM-dd")
          );
        });
    },

    async deleteOutbound(order_no) {
      try {
        const result = await axios
          .delete(`${serverUrl}/outbounds/${order_no}`)
        console.log(result);
        await this.fetchOutbound(this.start.toFormat("yyyy-MM-dd"),
          this.end.toFormat("yyyy-MM-dd"))
      } catch (err) {
        console.error(err)
      }

    },

    get columns() {
      const dateArr = [];
      let currentDate = this.start;
      while (Math.round(this.end.diff(currentDate, ["days"]).days) >= 0) {
        dateArr.push(currentDate);
        currentDate = currentDate.plus({ days: 1 });
      }

      const _columns = dateArr
        .map((date) => ({
          key: date.toFormat("yyyy-MM-dd"),
          name: date.toFormat("MM/dd"),
          width: 80,
          formatter({ column, row }) {
            return (
              <Tooltip title="더블클릭 시, 수정">
                <div
                  style={{ width: "100%", height: "100%" }}
                  onDoubleClick={() => {
                    const input = window.prompt(
                      `${column.key}\n${row["name"]}`,
                      row[column.key] ?? 0
                    );

                    if (typeof input === "string") {
                      if (typeof row[column.key] === "string")
                        store.updateOutbound(
                          row["skuid"],
                          column.key,
                          input ? input : "0"
                        );
                      else
                        store.addOutbound(
                          row["skuid"],
                          column.key,
                          input ? input : "0",
                          ""
                        );
                    }
                  }}
                >
                  {row[column.key]}
                </div>
              </Tooltip >
            );
          },
        }))
        .filter((column) => {
          return this.items.filter?.((item) => !!item[column.key]).length > 0;
        });

      return [
        { key: "num", name: "No.", width: 80 },
        { key: "skuid", name: "SKU ID", width: 150 },
        { key: "name", name: "상품명", width: 400 },
        ..._columns,
        {
          key: "total_sum",
          name: "합계",
          width: 80,
        },
      ];
    },
  }));

  useEffect(
    () =>
      autorun(() => {
        store.fetchOutbound(
          store.start.toFormat("yyyy-MM-dd"),
          store.end.toFormat("yyyy-MM-dd")
        );
      }),
    []
  );

  const handleFileChange = (e) => {
    transaction(() => {
      store.files = e.target.files;
      store.isOpen = true;
    });
  };

  const handleClose = (type) => {
    transaction(() => {
      if (type === 'create') {
        store.files = [];
        store.isOpen = false;
      } else {
        store.orderNo = '';
        store.isDeleteOpen = false;
      }
    });
  };

  const handleSuccess = () => {
    transaction(() => {
      store.fetchOutbound(store.start.toFormat("yyyy-MM-dd"),
        store.end.toFormat("yyyy-MM-dd"))
      store.isOpen = false;
      store.isDeleteOpen = false;
    })

  }

  const handleDelete = () => {
    const input = window.prompt(
      `발주번호`
    );

    const orderNo = input + '';

    if (isNumeric(orderNo)) {
      transaction(() => {
        store.isDeleteOpen = true;
        store.orderNo = orderNo;
      })
    }
  }

  return (
    <Wrapper>
      <Observer>
        {() =>
          store.isOpen && (
            <OrderListDialog
              open={store.isOpen}
              onClose={() => handleClose('create')}
              onSuccess={handleSuccess}
              files={store.files}
            />
          )
        }
      </Observer>

      <Observer>
        {() =>
          store.isDeleteOpen && (
            <DeleteOrderNoDialog
              open={store.isDeleteOpen}
              onClose={() => handleClose('delete')}
              onSuccess={handleSuccess}
              order_no={store.orderNo}
            />
          )
        }
      </Observer>

      <Observer>
        {() => (
          <Filter
            start={store.start}
            end={store.end}
            onStartChange={(value) => (store.start = value)}
            onEndChange={(value) => (store.end = value)}
          >
            <Button
              component="label"
              variant="contained"
              startIcon={<DeleteForeverIcon />}
              style={{ width: "180px", height: "40px", marginLeft: 'auto' }}
              onClick={handleDelete}
            >발주번호로 삭제</Button>

            <FileUploadButton
              title="발주서"
              onChange={handleFileChange}
              multiple
            />
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
            columns={store.columns}
          />
        )}
      </Observer>
    </Wrapper>
  );
}

export default Outbound;

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