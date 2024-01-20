import { Button, Dialog as MuiDialog, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import { DateTime } from 'luxon'
import axios from "axios";
import DataGrid from "react-data-grid";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function DeleteOrderNoDialog({ open, onClose, onSuccess, order_no }) {
    const store = useLocalObservable(() => ({
        items: [],

        fetchOutbound(order_no) {
            axios
                .get(`${serverUrl}/outbounds?order_no=${order_no}`)
                .then(({ data }) => {
                    this.items = data.result;
                });
        },
        async deleteOutbound(order_no) {
            return axios.delete(`${serverUrl}/outbounds/${order_no}`)
        },
        get columns() {
            const _columns = this.items.reduce((acc, cur) => {
                const { skuid, num, name, total_sum, value, ...remain } = cur
                acc = Object.keys(remain).map((key) => ({
                    key, name: key, width: 80, headerRenderer({ column }) {
                        return DateTime.fromFormat(column.key, 'yyyy-MM-dd').toFormat('MM/dd')
                    }
                }));
                return acc;
            }, [])

            return [
                { key: "num", name: "No.", width: 80 },
                { key: "skuid", name: "SKU ID", width: 150 },
                { key: "name", name: "상품명", width: 400 },
                ..._columns,
            ];
        },
    }));

    useEffect(() => {
        store.fetchOutbound(order_no)
    }, []);

    const handleDelete = () => {
        store.deleteOutbound(order_no)
        onSuccess();
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <strong style={{ fontSize: 20 }}>{`삭제 목록 (발주번호 : ${order_no})`}</strong>
            <Observer>
                {() =>

                    <div>
                        <Observer>
                            {() => (
                                <DataGrid
                                    style={{ width: "1100px" }}
                                    rows={store.items}
                                    columns={store.columns}
                                />
                            )}
                        </Observer>
                    </div>
                }
            </Observer>
            <div style={{ display: "flex", gap: "15px" }}>
                <Observer>
                    {() => (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleDelete}
                            disabled={!store.items.length}
                        >
                            삭제
                        </Button>
                    )}
                </Observer>
                <Button fullWidth variant="outlined" onClick={onClose}>
                    취소
                </Button>
            </div>
        </Dialog>
    );
}

const Dialog = styled(MuiDialog)`
  .MuiPaper-root {
    padding: 15px;
    gap: 20px;
    max-width: none;
  }
`;
