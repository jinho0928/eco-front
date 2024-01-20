import { Button, Dialog as MuiDialog, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import { parsePackingList, readFileAsArrayBuffer } from "../utils";
import { toJS, transaction } from "mobx";
import { DateTime } from "luxon";
import axios from "axios";
import DataGrid from "react-data-grid";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function PackingListDialog({ open, onClose, onSuccess, files }) {
  const store = useLocalObservable(() => ({
    date: "",
    packingItems: [],
    isOpen: false,
    isLoaded: false,

    async addInbound() {
      const date = DateTime.fromFormat(`${store.date}`, "yyMMdd").toFormat(
        "yyyy-MM-dd"
      );
      const list = toJS(store.packingItems);

      try {
        await axios.post(`${serverUrl}/inbounds`, {
          date,
          list,
        });

      } catch (err) {
        console.error(err);
      }
    },
  }));

  useEffect(() => {
    (async () => {
      const buffer = await readFileAsArrayBuffer(files[0]);
      const { items, date } = await parsePackingList({ arrayBuffer: buffer });

      transaction(() => {
        store.packingItems = items;
        store.date = date;
        store.isLoaded = true;
      });
    })();
  }, []);

  const handleAdd = async () => {
    await store.addInbound();
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <strong style={{ fontSize: 20 }}>패킹리스트</strong>
      <Observer>
        {() =>
          store.isLoaded && (
            <>
              <Observer>
                {() => <strong>{`Date : ${store.date}`}</strong>}
              </Observer>

              <Observer>
                {() => (
                  <DataGrid
                    style={{ width: "1000px" }}
                    rows={store.packingItems}
                    columns={[
                      {
                        key: "skuid",
                        name: "SKU ID",
                      },
                      {
                        key: "description",
                        name: "설명",
                      },
                      {
                        key: "value",
                        name: "입고수량",
                      },
                    ]}
                  />
                )}
              </Observer>
            </>
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
  display: flex;
  flex-direction: column;
  gap: 10px;

  .MuiPaper-root {
    padding: 15px;
    gap: 20px;
    max-width: none;
  }
`;
