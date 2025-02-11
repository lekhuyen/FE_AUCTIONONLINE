import { TiEyeOutline } from "react-icons/ti";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getAllProduct } from "../redux/slide/productSlide";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { FaCheck } from "react-icons/fa";
import { HiXMark  } from "react-icons/hi2";

import axios from '../../utils/../src/utils/axios'
import { useLoginExpired } from "../utils/helper";
import Pagination from "./common/layout/Pagination";
import moment from "moment";

export const Table = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const { products, isLoading } = useSelector(state => state.product)


  const [isLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  useEffect(() => {
    dispatch(getAllProduct())
  }, [dispatch])

  const handleDeleteProduct = id => {
    if (isLogin) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await dispatch(deleteProduct(id))
            if (res.payload.code === 0) {
              if (!isLoading) {
                await dispatch(getAllProduct({
                  page: products.currentPage,
                  size: products.pageSize
                }));
              }
            }
          } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired()
    }
  }

  useEffect(() => {
    if (products?.data?.length === 0 && products?.currentPage > 1) {
      navigate(`?page=${products?.currentPage - 1}`);
      dispatch(getAllProduct({
        page: products.currentPage - 1,
        size: products.pageSize
      }));
    }
  }, [products, dispatch, navigate])


  //update status
  const handleUpdateStatus = (id) => {
    if (isLogin) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this category status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Update"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.put(`auction/status/${id}`, {
              authRequired: true,
            })
            if (response.code === 0) {
              toast.success(response.message)
              await dispatch(getAllProduct({
                page: products.currentPage,
                size: products.pageSize
              }));
            } else {
              toast.error("Error: Unable to delete the category!");
            }
          } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired();
    }
  }


  //update sell
  const handleUpdateSell = (id) => {
    if (isLogin) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this category status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Update"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.put(`auction/issell/${id}`, {
              authRequired: true,
            })
            if (response) {
              toast.success(response.message)
              await dispatch(getAllProduct({
                page: products.currentPage,
                size: products.pageSize
              }));
            } else {
              toast.error("Error: Unable to delete the category!");
            }
          } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired();
    }
  }

  return (
    <>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-5">
                No
              </th>
              <th scope="col" className="px-6 py-5">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Start price
              </th>
              <th scope="col" className="px-6 py-3">
                Bid step
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Start date
              </th>
              <th scope="col" className="px-6 py-3">
                End date
              </th>
              {/* <th scope="col" className="px-6 py-3">
                isSell
              </th> */}
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Screator
              </th>
              <th scope="col" className="px-6 py-3">
                Selling
              </th>
              <th scope="col" className="px-6 py-3">
                Soldout
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
              products?.data?.length > 0 && products?.data?.map((product, index) => (
                <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{(products.currentPage - 1) * products.pageSize + index + 1}</td>
                  <td className="px-6 py-4">{product.item_name}</td>
                  <td className="px-6 py-4">{product.starting_price}</td>
                  <td className="px-6 py-4">{product.bid_step}</td>
                  <td className="px-6 py-4">{product.category.category_name}</td>
                  <td className="px-6 py-4">{moment(product.start_date).format("DD/MM/YYYY")}</td>
                  <td className="px-6 py-4">{moment(product.end_date).format("DD/MM/YYYY")}</td>
                  {/* <td className={`${product.sell ? "text-green" : "text-red-600"} px-6 py-4`}>{product.isSell ? "SOLD" : "NOT YET"}</td> */}
                  <td className="px-6 py-4">
                    <p onClick={() => handleUpdateStatus(product.item_id)} className={`${product.status ? "text-green" : "text-red-600"} cursor-pointer`}>
                      {product.status ? <FaCheck size={22} /> : <HiXMark  size={22} />}
                    </p>
                  </td>
                  <td className="px-6 py-4">{product.user.name}</td>
                  <td onClick={() => handleUpdateSell(product.item_id)} className={`${product.sell ? "text-green" : "text-red-600"} px-6 py-4 cursor-pointer`}>{product.sell ? <FaCheck size={22} /> : <HiXMark  size={22} />}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* <div className={`h-2.5 w-2.5 rounded-full  me-2 ${product.soldout ? "bg-green" : "bg-red-600"}`}></div> */}
                      <p className={`${product.soldout ? "text-green" : "text-red-600"} px-6 py-4`}>{product.soldout ? "Success" : "NOT YET"}</p>
                    </div>
                  </td>
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
                    <button className="font-medium text-red-500" onClick={() => handleDeleteProduct(product.item_id)}>
                      <MdOutlineDeleteOutline size={25} />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex justify-end">
        <Pagination
          listItem={products}
          to={"/product/admin"}
          methodCallApi={getAllProduct}
        />
      </div>
    </>
  );
};
