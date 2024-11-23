import { Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import {
  LoginAsSeller,
  Register,
  Login,
  UserProfile,
  DashboardLayout,
  Layout,
  CreateCategory,
  UpdateCategory,
  Catgeorylist,
  UpdateProductByAdmin,
  AdminProductList,
  Income,
  Dashboard,
  ProductList,
  ProductEdit,
  AddProduct,
  ProductsDetailsPage,
  Home,
  UserList,
  WinningBidList,
  NotFound,
  ScrollToTop,
  PrivateRoute,
} from "./router/index.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { introspect, logout } from "./redux/slide/authSlide.js";
import Swal from "sweetalert2";


function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)

  const [isIntrospect, setIsIntrospect] = useState(localStorage.getItem('isIntrospect') === "true" || false);

  const [alertShown, setAlertShown] = useState(isIntrospect);

  useEffect(() => {
    if (token) {
      dispatch(introspect(token));
    }
  }, [dispatch, token]);

  useEffect(() => {

    if (!isIntrospect && !alertShown) {
      Swal.fire({
        title: "Login expired, please login again!",
        confirmButtonText: "Login",
        customClass: {
          confirmButton: 'swal-confirm-button',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setAlertShown(true)
          dispatch(logout())
          navigate("/login");
        }
      });
    }
    // toast.error("Login expired, please login again!", { toastId: 'login-expired' });

  }, [isIntrospect, navigate, dispatch, alertShown])

  return (
    <>
      {/* <BrowserRouter> */}
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/seller/login"
          element={
            <PrivateRoute>
              <Layout>
                <LoginAsSeller />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AddProduct />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/income"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <Income />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <ProductEdit />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/details/:id"
          element={
            <Layout>
              <ProductsDetailsPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <ProductList />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product/admin"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminProductList />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product/admin/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <UpdateProductByAdmin />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/userlist"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <UserList />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/winning-products"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <WinningBidList />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <UserProfile />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/category"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <Catgeorylist />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/category/create"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <CreateCategory />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/category/update/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <UpdateCategory />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
      {/* </BrowserRouter> */}
    </>
  );
}

export default App;
