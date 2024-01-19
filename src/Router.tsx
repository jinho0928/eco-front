import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./layouts";
import * as Pages from "./pages";
import { authStore } from "./stores/authStore";
const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Pages.Login />}>
          로그인
        </Route>

        <Route
          path="/inbound"
          element={
            <Layout title={"입고"}>
              <Pages.Inbound />
            </Layout>
          }
        >
          입고
        </Route>
        <Route
          path="/outbound"
          element={
            <Layout title={"출고"}>
              <Pages.Outbound />
            </Layout>
          }
        >
          출고
        </Route>
        <Route
          path="/inventory"
          element={
            <Layout title={"재고"}>
              <Pages.Inventory />
            </Layout>
          }
        >
          재고
        </Route>
        <Route
          path="/outbounds"
          element={
            <Layout title={"출고리스트"}>
              <Pages.OutboundList />
            </Layout>
          }
        >
          예상출고리스트
        </Route>
        <Route
          path="/products"
          element={
            <Layout title={"상품리스트"}>
              <Pages.ProductList />
            </Layout>
          }
        >
          예상출고리스트
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={authStore.isLoggedIn ? "/inbound" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
