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
        />
        <Route
          path="/outbound"
          element={
            <Layout title={"출고"}>
              <Pages.Outbound />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout title={"재고"}>
              <Pages.Inventory />
            </Layout>
          }
        />
        <Route
          path="/trend"
          element={
            <Layout title={"판매추이"}>
              <Pages.Trend />
            </Layout>
          }
        />
        <Route
          path="/outbounds"
          element={
            <Layout title={"출고리스트"}>
              <Pages.OutboundList />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout title={"상품리스트"}>
              <Pages.ProductList />
            </Layout>
          }
        />
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
