import { Button, Dialog as MuiDialog, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import { parsePackingList, parseTrend, readFileAsArrayBuffer } from "../utils";
import { toJS, transaction } from "mobx";
import { DateTime } from "luxon";
import axios from "axios";
import DataGrid from "react-data-grid";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function TrendDialog({ open, onClose, onSuccess, files }) {
  const store = useLocalObservable(() => ({
    date: "",
    items: [],
    keys: [],
    isOpen: false,
    isLoaded: false,

    async addTrend() {
      const date = DateTime.fromFormat(`${store.date}`, "yyMMdd").toFormat(
        "yyyy-MM-dd"
      );
      //const inventory = parseInt(inventory.replace(/,/g, ''), 10);
      const list = toJS(store.items).map(
        ({ skuid, inventory, ...dates }) => {
          return {
            skuid,
            inventory: inventory ?? 0,
            dates: Object.entries(dates).reduce((acc, [key, value]) => {
              acc.push({ date: key, value });
              return acc;
            }, []),
          };
        }
      );

      try {
        await axios.post(`${serverUrl}/trend`, {
          list,
        });
      } catch (err) {
        console.error(err);
      }
    },

//////////////
    async updateTrend() {
      const date = DateTime.fromFormat(`${store.date}`, "yyMMdd").toFormat(
        "yyyy-MM-dd"
      );
      const list = toJS(store.items).map(({ skuid, inventory }) => ({
        skuid,
        inventory: inventory ?? 0,
      }));

      try {
        await axios.put(`${serverUrl}/trend`, {
        list,
        });
      } catch (err) {
        console.error(err);
      }
    },
/////////////

    get columns() {
      return [
        {
          key: "skuid",
          name: "SKU ID",
        },
        {
          key: "inventory",
          name: "현재고",
        },
        ...this.keys.slice(2).map((key) => ({ key, name: key })),
      ];
    },
  }));

  useEffect(() => {
    (async () => {
      const buffer = await readFileAsArrayBuffer(files[0]);
      const { rows, keys } = await parseTrend({ arrayBuffer: buffer });

      transaction(() => {
        store.items = rows;
        store.keys = keys;
        store.isLoaded = true;
      });
    })();
  }, []);

  const handleAdd = async () => {
    await store.addTrend();
    await store.updateTrend();
    onSuccess();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <strong style={{ fontSize: 20 }}>{`판매추이`}</strong>
      <Observer>
        {() =>
          store.isLoaded && (
            <>
              <Observer>
                {() => (
                  <DataGrid
                    style={{ width: "1000px" }}
                    rows={store.items}
                    columns={store.columns}
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
