import { Button, IconButton, Tooltip, styled } from "@mui/material";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import axios from "axios";
import { DateTime } from "luxon";
import { Observer, useLocalObservable } from "mobx-react";
import "react-data-grid/lib/styles.css";
import { autorun, transaction, values } from "mobx";
import EditIcon from "@mui/icons-material/Edit";
import { PackingListDialog } from "../components/PackingListDIalog";
import { Filter } from "../components/Filter";
import FileUploadButton from "../components/FileUploadButton";
import { customSort } from "../utils/sort";
import { TrendDialog } from "../components/TrendDialog";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadExcel } from "../utils";

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
                    const items = data.result.reduce((acc, item) => {
                        const { skuid, date, inventory, name, num, value, week_average, stock_date } = item;
                        if (acc[skuid]) {
                            acc[skuid][date] = value;
                        } else {

                            acc[skuid] = {
                                skuid,
                                name,
                                num,
                                inventory,
                                [date]: value,
                                week_average,
                                stock_date
                            }
                        }
                        return acc;
                    }, {});

                    this.items = Object.values(items)
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
                .filter((column) =>
                    this.items.filter((item) => !!item[column.key]).length > 0
                );


            return [
                { key: "num", name: "No.", width: 80 },
                { key: "skuid", name: "SKU ID", width: 150 },
                { key: "name", name: "상품명", width: 400 },
                { key: "inventory", name: "현재고", width: 100 },
                ..._columns,
                { key: "week_average", name: "재고(일)", width: 100 },
                { key: "stock_date", name: "주평균", width: 100 },
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

    
  const handleDownload = () => {
    downloadExcel(store.sortedItems, store.columns, `판매추이_${DateTime.now().toFormat('yy-MM-dd')}`);
  }

    return (
        <Wrapper>
            <Observer>
                {() =>
                    store.isOpen && (
                        <TrendDialog
                            open={store.isOpen}
                            onClose={handleClose}
                            files={store.files}
                            onSuccess={() => {
                                store.fetchTrends(
                                    store.start.toFormat("yyyy-MM-dd"),
                                    store.end.toFormat("yyyy-MM-dd")
                                )
                                handleClose();
                            }
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
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            style={{ width: "150px", height: "40px" }}
                            onClick={handleDownload}
                        >엑셀 다운로드</Button>
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
