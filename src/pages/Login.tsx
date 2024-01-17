import {
  Button as MuiButton,
  TextField as MuiTextField,
  styled,
} from "@mui/material";
import { Observer, useLocalObservable } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../stores/authStore";

function Login() {
  const navigate = useNavigate();
  const store = useLocalObservable(() => ({
    id: "admin",
    password: "",
  }));

  const handleEnter = async (e) => {
    if (e.key === "Enter") {
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    try {
      await authStore.login(store.id, store.password);
      navigate("/inbound");
    } catch (err) {
      navigate("/login");
    }
  };

  return (
    <Wapper>
      <div className="login__container">
        <div className="login__logo">
          <img className="login__logo-image" src="/logo_white.png" alt="logo" />
          <strong>에코프리미어</strong>
          <strong>재고관리 시스템</strong>
        </div>

        <div className="login__input-container">
          <Observer>
            {() => (
              <TextField
                value={store.id}
                InputProps={{
                  startAdornment: <AdormentText>ID</AdormentText>,
                }}
                onChange={(e) => (store.id = e.target.value)}
              />
            )}
          </Observer>

          <Observer>
            {() => (
              <TextField
                type="password"
                InputProps={{
                  startAdornment: <AdormentText>PW</AdormentText>,
                }}
                value={store.password}
                onChange={(e) => (store.password = e.target.value)}
                onKeyDown={handleEnter}
              />
            )}
          </Observer>
        </div>

        <Button onClick={handleLogin} variant="contained">
          로그인
        </Button>
      </div>
    </Wapper>
  );
}

export default Login;

const Wapper = styled("div")`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  .login__container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login__logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .login__logo-image {
    width: 180px;
    height: auto;
    margin-bottom: 10px;
  }

  .login__input-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
  }
`;

const TextField = styled(MuiTextField)`
  width: 300px;
  .MuiInputBase-input {
    padding: 12px 14px;
  }

  .MuiOutlinedInput-notchedOutline {
    border-radius: 13px;
  }
`;

const AdormentText = styled("strong")`
  flex: 0 0 30px;
`;

const Button = styled(MuiButton)`
  display: flex;
  width: 300px;
  height: 47px;
  border-radius: 13px;
  font-size: 16px;
  background: #bfd62e;
  font-weight: bold;
  color: #000000;

  :hover {
    background: #bfd62e;
    opacity: 0.9;
  }
`;
