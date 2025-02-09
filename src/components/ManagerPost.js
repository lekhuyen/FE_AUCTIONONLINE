import React, { useEffect, useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { PiPlus } from "react-icons/pi";
import { TiEyeOutline } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { useLoginExpired } from '../utils/helper';
import Swal from 'sweetalert2';
import { deleteProduct, getAllProductByBuyer, getAllProductByCreator, } from '../redux/slide/productSlide';
import { toast } from 'react-toastify';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { checkout } from '../service/apiService';
import clsx from 'clsx';

const ManagerPost = () => {
  const dispatch = useDispatch()
  const [clickMenu, setClickMenu] = useState(0)
  const [exprise, setExprise] = useState([])
  const [isCheck, setIsCheck] = useState([])
  const [isActive, setIsActive] = useState([])
  const [productSoldOut, setProductSoldOut] = useState([])
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState(null);
  const { productsOfCreator, isLoading, productsOfBuyer } = useSelector(state => state.product)
  const [url, setUrl] = useState("");
  const listMenu = [
    { name: 'Đang hiển thị' },
    { name: 'Hết hạn' },
    { name: 'Chờ duyệt' },
    { name: 'Đấu giá thành công' },
    { name: 'Đã bán' },
  ]
  const [isLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)
        setUserName(tokenInfo.username);

        setUserId(tokenInfo.userid)
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])

  useEffect(() => {
    if (productsOfCreator?.length > 0) {
      // const now = moment();
      // const expiredProducts = productsOfCreator.filter(product => moment(product.end_date).isBefore(now));
      const check = productsOfCreator.filter(product => product.status === true);
      const isactiveProducts = productsOfCreator.filter(product => product.status === false);
      const productsSoldOut = productsOfCreator.filter(product => product.soldout === true);

      // setExprise(expiredProducts);
      setIsCheck(check);
      setIsActive(isactiveProducts);
      setProductSoldOut(productsSoldOut);
    }
  }, [productsOfCreator]);

  useEffect(() => {
    if (userId) dispatch(getAllProductByCreator(userId))
  }, [dispatch, userId])
  useEffect(() => {
    if (userId) dispatch(getAllProductByBuyer(userId))
  }, [dispatch, userId])


  const [visibleCountIsCheck, setVisibleCountIsCheck] = useState(5);
  const [visibleCountIsActive, setVisibleCountIsActive] = useState(5);

  const handleShowMoreisCheck = () => {
    setVisibleCountIsCheck(prev => prev + 5);
  };
  const handleShowLessIsCheck = () => {
    setVisibleCountIsCheck(5);
  };
  const handleShowMoreisActive = () => {
    setVisibleCountIsActive(prev => prev + 5);
  };
  const handleShowLessIsActive = () => {
    setVisibleCountIsActive(5);
  };

  const handlePayment = (id) => {
    const uniqueOrderId = `order_${id}_${Date.now()}`;
    const product = productsOfBuyer.find(product => product.item_id === id);
    if (product?.bidding?.price) {
      checkout(id, product?.bidding?.price, uniqueOrderId)
        .then((res) => {
          // setUrl(res.data.data?.paymentUrl)
          window.location.href = res.data.data?.paymentUrl
        })
        .catch((err) => console.error(err));
    }
  }


  return (
    <section className='flex justify-center'>
      <div className="bg-white shadow-s3 w-1/2 rounded-xl">
        <div className="mt-[90px] w-full ">
          <div className=" flex border-b border-[#e0e0e0]">
            <img className="w-[46px]" alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
            <div className="flex flex-col ">
              <span className="text-slate-800 font-bold">{userName}</span>
              <Link className="text-[14px] flex items-center text-[#306bd9]"> <PiPlus /> Add new product </Link>
            </div>
          </div>
          <div className="p-3">
            <ul className="flex">
              {listMenu.map((item, index) => (
                <li key={index} onClick={() => setClickMenu(index)} className="cursor-pointer mr-3 font-bold uppercase ">
                  <span
                    className={`transition-all duration-300 ${clickMenu === index ? "border-b-2 border-blue-900 translate-x-2" : "translate-x-0"
                      }`}
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-3 pr-3">
            {
              clickMenu !== 4 && (
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-5">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Start price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Current price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Start date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        End date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Images
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      clickMenu === 2 && (
                        (
                          isCheck?.length > 0 && isCheck?.slice(0, visibleCountIsCheck).map((product, index) => (
                            <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4">{product.item_name}</td>
                              <td className="px-6 py-4">{product.starting_price}</td>
                              <td className="px-6 py-4">{!product?.bidding?.price ? product.starting_price : product?.bidding?.price}</td>
                              <td className="px-6 py-4">{moment(product.start_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">{moment(product.end_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">
                                {product?.images.map((img, index) => (
                                  <img key={index} className="w-10 h-10" src={img} alt="Jeseimage" />
                                ))}
                              </td>
                              <td className="px-6 py-4 text-center flex items-center gap-3 mt-1">
                                <NavLink to="#" type="button" className="font-medium text-indigo-500">
                                  <TiEyeOutline size={25} />
                                </NavLink>
                                <NavLink to={`/product/update/${product.item_id}`} type="button" className="font-medium text-green">
                                  <CiEdit size={25} />
                                </NavLink>
                                {/* <button className="font-medium text-red-500" onClick={() => handleDeleteProduct(product.item_id)}>
                          <MdOutlineDeleteOutline size={25} />
                        </button> */}
                              </td>
                            </tr>
                          ))
                        )
                      )
                    }

                    {
                      clickMenu === 0 && (
                        (
                          isActive?.length > 0 && isActive?.slice(0, visibleCountIsActive).map((product, index) => (
                            <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                              {/* <td className="px-6 py-4">{(productsbycategory.currentPage - 1) * productsbycategory.pageSize + index + 1}</td> */}
                              <td className="px-6 py-4">{product.item_name}</td>
                              <td className="px-6 py-4">{product.starting_price}</td>
                              <td className="px-6 py-4">{!product?.bidding?.price ? product.starting_price : product?.bidding?.price}</td>
                              <td className="px-6 py-4">{moment(product.start_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">{moment(product.end_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">
                                {product?.images.map((img, index) => (
                                  <img key={index} className="w-10 h-10" src={img} alt="Jeseimage" />
                                ))}
                              </td>
                              <td className="px-6 py-4 text-center flex items-center gap-3 mt-1">
                                <NavLink to="#" type="button" className="font-medium text-indigo-500">
                                  <TiEyeOutline size={25} />
                                </NavLink>
                                <NavLink to={`/product/update/${product.item_id}`} type="button" className="font-medium text-green">
                                  <CiEdit size={25} />
                                </NavLink>
                                {/* <button className="font-medium text-red-500" onClick={() => handleDeleteProduct(product.item_id)}>
                          <MdOutlineDeleteOutline size={25} />
                        </button> */}
                              </td>
                            </tr>
                          ))
                        )
                      )
                    }
                    {
                      clickMenu === 3 && (
                        productsOfBuyer?.length > 0 &&
                        productsOfBuyer.filter(product => product?.buyer?.id === userId).map((product) => (
                          <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{product.item_name}</td>
                            <td className="px-6 py-4">{product.starting_price}</td>
                            <td className="px-6 py-4">{product?.bidding?.price}</td>
                            <td className="px-6 py-4">{moment(product.start_date).format("DD/MM/YYYY")}</td>
                            <td className="px-6 py-4">{moment(product.end_date).format("DD/MM/YYYY")}</td>
                            <td className="px-6 py-4">
                              {product?.images.map((img, index) => (
                                <img key={index} className="w-10 h-10" src={img} alt="Product Image" />
                              ))}
                            </td>
                            <td className="px-0 py-5">
                              <div className="w-[100px] h-[40px] bg-green border rounded-md flex justify-center items-center">
                                <button onClick={() => handlePayment(product.item_id)} type="button" className="font-medium text-white">
                                  {product.paid === false ? "Payment" : "Paid"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    }

                  </tbody>
                </table>
              )
            }
            {
              clickMenu === 4 && productSoldOut?.length > 0 && productSoldOut?.slice(0, visibleCountIsActive).map((product, index) => (
                <div key={product.item_id} className="border-b border-gray-400">
                  <p className="text-[14px]">Ten san pham: <span className="text-[16px] font-bold">{product.item_name}</span></p>
                  <p className="text-[14px]">Price: <span className="text-[16px] font-bold">{product?.bidding?.price}</span></p>
                  <p className="text-[14px]">Ngay ban: <span className="text-[16px] font-bold">{moment(product.end_date).format("DD/MM/YYYY")}</span></p>
                  <p className="text-[14px]">Nguoi mua: <span className="text-[16px] font-bold">{product?.buyer?.name}</span></p>
                  <p className="text-[14px]">STD: <span className="text-[16px] font-bold">{product?.buyer?.email}</span></p>
                  <p className="text-[14px]">Thanh toan: <span className={clsx("text-[16px] font-bold", product?.paid === false ? "" : "text-red-500")}>{product?.paid === true ? "Da thanh toan" : "Chua thanh toan"}</span></p>
                </div>
              ))
            }
            {clickMenu === 4 && visibleCountIsActive < isActive.length && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowMoreisActive} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                  Xem thêm
                </button>
              </div>
            )}
            {clickMenu === 4 && visibleCountIsActive > 5 && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowLessIsActive} className="px-4 py-0 bg-red-500 text-white rounded-md">
                  Ẩn bớt
                </button>
              </div>
            )}
          </div>

          {/* cho duyet */}
          {clickMenu === 2 && visibleCountIsCheck < isCheck.length && (
            <div className="text-center mt-4 pb-1">
              <button onClick={handleShowMoreisCheck} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                Xem thêm
              </button>
            </div>
          )}
          {clickMenu === 2 && visibleCountIsCheck > 5 && (
            <div className="text-center mt-4 pb-1">
              <button onClick={handleShowLessIsCheck} className="px-4 py-0 bg-red-500 text-white rounded-md">
                Ẩn bớt
              </button>
            </div>
          )}

          {/* dang hien thi */}
          {clickMenu === 0 && visibleCountIsActive < isActive.length && (
            <div className="text-center mt-4 pb-1">
              <button onClick={handleShowMoreisActive} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                Xem thêm
              </button>
            </div>
          )}
          {clickMenu === 0 && visibleCountIsActive > 5 && (
            <div className="text-center mt-4 pb-1">
              <button onClick={handleShowLessIsActive} className="px-4 py-0 bg-red-500 text-white rounded-md">
                Ẩn bớt
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ManagerPost;