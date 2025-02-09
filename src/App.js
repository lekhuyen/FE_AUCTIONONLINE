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
  PrivateRoute, Contact, AboutUsComponents,
} from "./router/index.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { introspect, logout } from "./redux/slide/authSlide.js";
import Swal from "sweetalert2";
import Loading from "./components/Loading/index.js";
import Chat from "./components/chat/chat.js";
import { addNotification, getAllProduct } from "./redux/slide/productSlide.js";
import ProductPage from "./admin/product/ProductPage.js";
import SearchPageProduct from "./screens/product/SearchPageProduct.js";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import VideoCall from "./components/VideoCall.js";
import VideoChat from "./components/VideoChat.js";
import Checkout from "./components/Checkout.js";
import PaymentResult from "./components/PaymentResult.js";
import ManagerPost from "./components/ManagerPost.js";


function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const { isLoading } = useSelector(state => state.product)
  // const { isLoading: isLoadingUser } = useSelector(state => state.auth)
  const [notification, setNotification] = useState('')
  const [stompClient, setStompClient] = useState(null);


  useEffect(() => {
    dispatch(getAllProduct({
      page: 0,
      size: 0
    }));
  }, [dispatch])


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


  // dau gia
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketFactory = () => {
      return new SockJS('http://localhost:8080/ws', null, {
        withCredentials: true,
      });
    };

    const client = Stomp.over(socketFactory);

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      // console.log("Connected to WebSocket");


      client.subscribe('/topic/notification', (message) => {
        const newNotification = JSON.parse(message.body);
        // console.log(newNotification);

        setNotification(newNotification);
      });
    }, (error) => {
      console.error("WebSocket connection error:", error);
    });

    setStompClient(client);

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      }
    };


  }, [])

  useEffect(() => {
    if (notification) {
      dispatch(addNotification(notification))
    }
  }, [dispatch, notification])

  return (
    <>
      {isLoading && <Loading />}
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
          path="/manager-post"
          element={
            <Layout>
              <ManagerPost />
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
          path="/chat"
          // path="/chat/:id"
          element={
            <Layout>
              <Chat />
            </Layout>
          }
        />
        <Route
          path="/product-list/:productId"
          element={
            <Layout>
              <ProductPage />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchPageProduct />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        {/* xoa sau */}
        <Route
          path="/room"
          element={
            <Layout>
              <VideoCall />
            </Layout>
          }
        />
        <Route
          path="/roomchat"
          element={
            <Layout>
              <VideoChat />
            </Layout>
          }
        />

        {/* payment */}

        <Route
          path="/checkout/:id"
          element={
            <Layout>
              <Checkout />
            </Layout>
          }
        />
        <Route
          path="/success"
          element={
            <Layout>
              <PaymentResult />
            </Layout>
          }
        />

        <Route
          path="/test"
          element={
            <Layout>
              <AboutUsComponents />
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
