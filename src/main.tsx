import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { configure } from "mobx";
import "./index.css";

configure({
  enforceActions: "never",
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
