import { Button, IconButton, Tooltip, styled } from "@mui/material";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import axios from "axios";
import { DateTime } from "luxon";
import { Observer, useLocalObservable } from "mobx-react";
import "react-data-grid/lib/styles.css";
import { autorun, transaction } from "mobx";
import EditIcon from "@mui/icons-material/Edit";
import { PackingListDialog } from "../components/PackingListDIalog";
import { Filter } from "../components/Filter";
import FileUploadButton from "../components/FileUploadButton";
import { customSort } from "../utils/sort";
import { TrendDialog } from "../components/TrendDialog";

const serverUrl = import.meta.env.VITE_SERVER_URL;

function Trend() {
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

        fetchTrends(start, end) {
            axios
                .get(`${serverUrl}/trend?start=${start}&end=${end}`)
                .then(({ data }) => {
                    this.items = data.result;
                });
        },

        updateInbound(skuid, date, value) {
            axios
                .put(`${serverUrl}/inbounds/${skuid}`, { date, value })
                .then(({ data }) => {
                    this.fetchInbounds(
                        this.start.toFormat("yyyy-MM-dd"),
                        this.end.toFormat("yyyy-MM-dd")
                    );
                });
        },

        addInbound(skuid, date, value) {
            const list = [{ skuid, value }];

            axios
                .post(`${serverUrl}/inbounds`, {
                    date,
                    list,
                })
                .then(({ data }) => {
                    this.fetchInbounds(
                        this.start.toFormat("yyyy-MM-dd"),
                        this.end.toFormat("yyyy-MM-dd")
                    );
                });
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
                    width: 80
                }))
                .filter((column) => {
                    return this.items.filter((item) => !!item[column.key]).length > 0;
                });

            return [
                { key: "num", name: "No.", width: 80 },
                { key: "skuid", name: "SKU ID", width: 150 },
                { key: "name", name: "상품명", width: 400 },
                ..._columns,
                {
                    key: "sum",
                    name: "합계",
                    width: 80,
                },
            ];
        },
    }));

    useEffect(
        () =>
            autorun(() => {
                store.fetchTrends(
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

    const handleClose = () => {
        transaction(() => {
            store.files = [];
            store.isOpen = false;
        });
    };

    return (
        <Wrapper>
            <Observer>
                {() =>
                    store.isOpen && (
                        <TrendDialog
                            open={store.isOpen}
                            onClose={handleClose}
                            files={store.files}
                            onAdd={() =>
                                store.fetchTrends(
                                    store.start.toFormat("yyyy-MM-dd"),
                                    store.end.toFormat("yyyy-MM-dd")
                                )
                            }
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
                        <FileUploadButton
                            title="판매추이"
                            onChange={handleFileChange}
                        />
                    </Filter>
                )}
            </Observer>

            <Observer>
                {() => (
                    <DataGrid
                        rows={store.sortedItems}
                        columns={store.columns}
                        defaultColumnOptions={{ resizable: true, sortable: true }}
                        sortColumns={store.sortColumns}
                        onSortColumnsChange={(columns) => (store.sortColumns = columns)}
                    />
                )}
            </Observer>
        </Wrapper>
    );
}

export default Trend;

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
        visibility: hidden;
      }

      &:hover {
        > .edit-button {
          visibility: visible;
        }
      }
    }
  }

  .inbound__header {
  }
`;