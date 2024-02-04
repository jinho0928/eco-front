import { Button, Dialog as MuiDialog, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import { parseFactoryOrder, readFileAsArrayBuffer } from "../utils";
import { toJS, transaction } from "mobx";
import { DateTime } from "luxon";
import axios from "axios";
import DataGrid from "react-data-grid";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function FactoryOrder({ open, onClose, onSuccess, files }) {
  const store = useLocalObservable(() => ({
    factoryItems: [],
    isOpen: false,
    isLoaded: false,

    async addFactory() {
      const list = toJS(store.factoryItems);

      try {
        await axios.post(`${serverUrl}/factory`, {
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
      const { items } = await parseFactoryOrder({ arrayBuffer: buffer });
      transaction(() => {
        store.factoryItems = items;
        store.isLoaded = true;
      });
    })();
  }, []);

  const handleAdd = async () => {
    await store.addFactory();
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <strong style={{ fontSize: 20 }}>공장주문서</strong>
      <Observer>
        {() =>
          store.isLoaded && (
            <>
              <Observer>
                {() => (
                  <DataGrid
                    style={{ width: "1000px" }}
                    rows={store.factoryItems}
                    columns={[
                      {
                        key: "num",
                        name: "Item.no",
                      },
                      {
                        key: "value",
                        name: "수량",
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
