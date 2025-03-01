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
  Contact,
  AboutUsComponents,
  AdminContact,
  ContactDetailPage,
  AdminAboutUs, BlogPage, BlogDetail, AdminBlog, AdminBlogDetail, AdminBlogAdd,

} from "./router/index.js";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { introspect, logout } from "./redux/slide/authSlide.js";
import Swal from "sweetalert2";
import Loading from "./components/Loading/index.js";
import Chat from "./components/chat/chat.js";
import { addNotification, getAllProduct, getAllProductBidding, notificationBidding } from "./redux/slide/productSlide.js";
import ProductPage from "./admin/product/ProductPage.js";
import SearchPageProduct from "./screens/product/SearchPageProduct.js";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import VideoCall from "./components/VideoCall.js";
import VideoChat from "./components/VideoChat.js";
import Checkout from "./components/Checkout.js";
import PaymentResult from "./components/PaymentResult.js";
import ManagerPost from "./components/ManagerPost.js";
import { jwtDecode } from "jwt-decode";
import { debounce } from "lodash";
import axios from "../src/utils/axios";
import AddressForm from "./components/AddressForm.js";
import ForgotPassword from "./components/ForgotPassword.js";
import ProfilePage from "./components/ProfilePage.js";
import QRScanner from "./components/QRScanner.js";
import OCRReader from "./components/OCRReader.js";

function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token, isLoggedIn } = useSelector(state => state.auth)
  const { isLoading, products, productsBidding } = useSelector(state => state.product)
  const [notification, setNotification] = useState('')
  const [stompClient, setStompClient] = useState(null);
  const prevProductsRef = useRef([]);
  const [userId, setUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLength, setNotificationsLength] = useState([])

  useEffect(() => {
    dispatch(getAllProduct({
      page: 0,
      size: 0
    }));
  }, [dispatch])

  const debouncedGetAllProduct = debounce(() => {
    dispatch(getAllProductBidding());
  }, 3000);

  useEffect(() => {
    dispatch(getAllProductBidding());
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)
        setUserId(tokenInfo.userid)
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])

  // tự động chốt phiên đấu giá khi end_date <= now
  useEffect(() => {
    if (Array.isArray(productsBidding) && productsBidding.length > 0) {
      prevProductsRef.current = [...productsBidding];
    }
  }, [productsBidding]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      getNotification()
    }
  }, [isLoggedIn, isLogin, userId])
  const getNotification = async () => {
    if (isLogin && userId) {
      try {
        const response = await axios.get("bidding/notification/" + userId, { authRequired: true })

        if (response.code === 0) {
          dispatch(notificationBidding(response.result))
          setNotificationsLength(response.result)
          setNotifications(response.result)
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!Array.isArray(productsBidding)) return;

    const interval = setInterval(async () => {
      if (isProcessing || isLoading) return; // Prevent multiple requests

      setIsProcessing(true);
      debouncedGetAllProduct();

      const now = new Date();
      console.log("Checking for expired products...");

      // Lọc các sản phẩm đã hết hạn
      const expiredProducts = productsBidding.filter((product) => {
        if (!Array.isArray(product.end_date) || product.end_date.length < 3) return false;

        const [year, month, day] = product.end_date;
        const endDate = new Date(year, month - 1, day);
        return endDate <= now && !product.isSoldOut;
      });


      for (const product of expiredProducts) {
        if (userId) {
          console.log(`⚡ Auction success for: ${product.item_name}`);

          if (token) {
            try {
              const response = await axios.post(`/bidding/success/${product.item_id}/${product.user.id}`, null, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
              });
              console.log(response);
            } catch (error) {
              console.error(`Error during auction success for ${product.item_name}:`, error);
            }
          } else {
            console.log("No token found, skipping auction success.");
          }
        }
      }

      setIsProcessing(false);
    }, 12 * 60 * 60 * 1000);
    // 12 * 60 * 60 * 1000
    return () => clearInterval(interval);

  }, [dispatch, userId, products, isLoading, isProcessing]);



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
    client.debug = () => { };

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
          path="/profile-page"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
        <Route
          path="/citizen-verify"
          element={
            <Layout>
              <QRScanner />
            </Layout>
          }
        />
        <Route
          path="/ocr-reader"
          element={
            <Layout>
              <OCRReader />
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
          path="/address"
          element={
            <Layout>
              <AddressForm />
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
        <Route
          path="/forgot-password"
          element={
            <Layout>
              <ForgotPassword />
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
          path="/about"
          element={
            <Layout>
              <AboutUsComponents />
            </Layout>
          }
        />
        <Route
          path="/blog"
          element={
            <Layout>
              <BlogPage />
            </Layout>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <Layout>
              <BlogDetail />
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
          path="/AdminAboutUs"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminAboutUs />
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
          path="/adminblog"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminBlog />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/adminblog/detail/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminBlogDetail />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/adminblog/add"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminBlogAdd />
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
          path="/adminContact"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <AdminContact />
                </DashboardLayout>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/adminContact/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardLayout>
                  <ContactDetailPage />
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
