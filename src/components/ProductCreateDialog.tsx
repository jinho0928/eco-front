import { Button, Dialog as MuiDialog, TextField, styled } from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import axios from "axios";
import { useEffect } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export function ProductCreateDialog({ open, onClose }) {
  const store = useLocalObservable(() => ({
    skuid: "",
    num: "",
    name: "",
    qtyset: "",
    qtypallet: "",

    get isValid() {
      return (
        this.skuid && this.num && this.name && this.qtyset && this.qtypallet
      );
    },

    async createProduct() {
      await axios.post(`${serverUrl}/products`, {
        list: [
          {
            skuid: this.skuid,
            num: this.num,
            name: this.name,
            qtyset: this.qtyset,
            qtypallet: this.qtypallet,
          },
        ],
      });
    },

    clear() {
      this.skuid = "";
      this.num = "";
      this.name = "";
      this.qtyset = "";
      this.qtypallet = "";
    },
  }));

  useEffect(() => {
    if (open) store.clear();
  }, [open]);
  const handleCreate = async () => {
    await store.createProduct();
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="product-dialog__title">
        <strong>상품 추가</strong>
      </div>
      <div className="product-dialog__inputs">
        <div className="inputs__item">
          <strong>SKU ID</strong>
          <Observer>
            {() => (
              <TextField
                value={store.skuid}
                onChange={(e) => (store.skuid = e.target.value)}
                autoFocus
              />
            )}
          </Observer>
        </div>
        <div className="inputs__item">
          <strong>No.</strong>
          <Observer>
            {() => (
              <TextField
                value={store.num}
                onChange={(e) => (store.num = e.target.value)}
              />
            )}
          </Observer>
        </div>
        <div className="inputs__item">
          <strong>상품명</strong>
          <Observer>
            {() => (
              <TextField
                value={store.name}
                onChange={(e) => (store.name = e.target.value)}
              />
            )}
          </Observer>
        </div>
        <div className="inputs__item">
          <strong>QTY Set</strong>
          <Observer>
            {() => (
              <TextField
                value={store.qtyset}
                onChange={(e) => (store.qtyset = e.target.value)}
              />
            )}
          </Observer>
        </div>
        <div className="inputs__item">
          <strong>QTY Pallet</strong>
          <Observer>
            {() => (
              <TextField
                value={store.qtypallet}
                onChange={(e) => (store.qtypallet = e.target.value)}
              />
            )}
          </Observer>
        </div>
      </div>

      <div className="product-dialog__buttons">
        <Observer>
          {() => (
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreate}
              disabled={!store.isValid}
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
  .product-dialog__title {
    display: flex;
    align-items: center;
    font-size: 22px;
  }

  .product-dialog__inputs {
    display: flex;
    flex-direction: column;
    gap: 5px;

    strong {
      font-size: 13px;
    }

    .inputs__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    input {
      height: 1rem;
      padding: 12px 14px;
    }
  }

  .product-dialog__buttons {
    display: flex;
    gap: 15px;
  }
`;
