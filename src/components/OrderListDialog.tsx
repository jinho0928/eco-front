import { Button, Dialog as MuiDialog, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import {
  parseOrderList,
  readFileAsArrayBuffer,
} from "../utils";
import { toJS, transaction } from "mobx";
import axios from "axios";
import DataGrid from "react-data-grid";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function OrderListDialog({ open, onClose, files }) {
  const store = useLocalObservable(() => ({
    orderList: [],
    isOpen: false,
    isLoaded: false,

    async addOutbound() {
      const list = toJS(store.orderList).map(
        ({ skuid, date, availableAmount, order_no }) => ({
          skuid,
          date,
          value: availableAmount,
          order_no
        })
      );

      await axios.post(`${serverUrl}/outbounds`, {
        list,
      });

      //   await this.fetchOutbound(
      //     store.start.toFormat("yyyy-MM-dd"),
      //     store.end.toFormat("yyyy-MM-dd")
      //   );
    },
  }));

  useEffect(() => {
    (async () => {
      const buffers = await Promise.all(
        Array.from(files).map((file) => readFileAsArrayBuffer(file))
      );
      const itemList = await Promise.all(
        buffers.map((arrayBuffer) => parseOrderList({ arrayBuffer }))
      );

      transaction(() => {
        store.orderList = itemList.flat();
        store.isLoaded = true;
      });
      console.log('loaded')
    })();
  }, []);

  const handleAdd = async () => {
    await store.addOutbound();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Observer>
        {() =>
          store.isLoaded && (
            <div>
              <Observer>
                {() => (
                  <DataGrid
                    style={{ width: "1100px" }}
                    rows={store.orderList}
                    columns={[
                      {
                        key: "skuid",
                        name: "SKU ID",
                      },
                      {
                        key: "customer",
                        name: "거래처명",
                      },
                      {
                        key: "logistics",
                        name: "물류센터",
                      },
                      {
                        key: "date",
                        name: "입고예정일",
                      },
                      {
                        key: "name",
                        name: "상품명",
                      },
                      {
                        key: "order_no",
                        name: "발주번호",
                      },
                      {
                        key: "availableAmount",
                        name: "업체납품 가능수량",
                      },
                    ]}
                  />
                )}
              </Observer>
            </div>
          )
        }
      </Observer>
      <div style={{ display: "flex", gap: "15px" }}>
        <Observer>
          {() => (
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              disabled={!store.isLoaded}
            >
              저장
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
