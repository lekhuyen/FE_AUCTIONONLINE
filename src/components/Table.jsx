import { TiEyeOutline } from "react-icons/ti";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getAllProduct } from "../redux/slide/productSlide";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import axios from '../../utils/../src/utils/axios'
import { useLoginExpired } from "../utils/helper";

export const Table = () => {
  const dispatch = useDispatch()
  const { products } = useSelector(state => state.product)
  // console.log(products);

  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
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
              dispatch(getAllProduct())
            }
          } catch (error) {
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired()
    }
  }

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
              dispatch(getAllProduct())
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
                  <td className="px-6 py-4">{product.start_date}</td>
                  <td className="px-6 py-4">{product.end_date}</td>
                  {/* <td className={`${product.sell ? "text-green" : "text-red-600"} px-6 py-4`}>{product.isSell ? "SOLD" : "NOT YET"}</td> */}
                  <td className="px-6 py-4">
                    <p onClick={() => handleUpdateStatus(product.item_id)} className={`${product.status ? "text-green" : "text-red-600"} cursor-pointer`}>
                      {product.status ? <FaCheck size={22} /> : <FaXmark size={22} />}
                    </p>
                  </td>
                  <td className="px-6 py-4">{product.user.name}</td>
                  <td className={`${product.sell ? "text-green" : "text-red-600"} px-6 py-4`}>{product.sell ? "SELLING" : "NOT YET"}</td>
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
    </>
  );
};

/* export const Table = ({ products, handleSellProduct, delProduct, isAdmin, isWon }) => {
  return (
    <>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-5">
                S.N
              </th>
              <th scope="col" className="px-6 py-5">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Commission
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Bid Amount(USD)
              </th>
              <th scope="col" className="px-6 py-3">
                Image
              </th>
              {isWon && (
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              )}
              {!isWon && (
                <>
                  <th scope="col" className="px-6 py-3">
                    Verify
                  </th>
                  {!isAdmin && (
                    <th scope="col" className="px-6 py-3">
                      Sold
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr className="bg-white border-b hover:bg-gray-50" key={index}>
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{product?.title?.slice(0, 15)}...</td>
                <td className="px-6 py-4">{product?.commission}%</td>
                <td className="px-6 py-4">{product?.price}</td>
                <td className="px-6 py-4">{product?.biddingPrice}</td>
                <td className="px-6 py-4">
                  <img className="w-10 h-10" src={product?.image?.filePath} alt="Jeseimage" />
                </td>
                {!isWon && (
                  <>
                    <td className="px-6 py-4">
                      {product?.isverify ? (
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-green me-2"></div> Yes
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div> No
                        </div>
                      )}
                    </td>
                    {!isAdmin && (
                      <td className="py-3 px-6">
                        {product?.isSoldout ? (
                          <button className="bg-red-500 text-white py-1 px-3 rounded-lg" disabled>
                            Sold Out
                          </button>
                        ) : (
                          <button
                            className={`py-1 px-3 rounded-lg ${product?.isverify ? "bg-green text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}
                            onClick={() => handleSellProduct(product._id)}
                            disabled={!product?.isverify}
                          >
                            Sell
                          </button>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-center flex items-center gap-3 mt-1">
                      <NavLink to="#" type="button" className="font-medium text-indigo-500">
                        <TiEyeOutline size={25} />
                      </NavLink>
                      {isAdmin ? (
                        <NavLink to={`/product/admin/update/${product._id}`} className="font-medium text-green">
                          <CiEdit size={25} />
                        </NavLink>
                      ) : (
                        <NavLink to={`/product/update/${product._id}`} className="font-medium text-green">
                          <CiEdit size={25} />
                        </NavLink>
                      )}
                      {!isAdmin && (
                        <button onClick={() => delProduct(product._id)} className="font-medium text-red-500">
                          <MdOutlineDeleteOutline size={25} />
                        </button>
                      )}
                    </td>
                  </>
                )}
                {isWon && (
                  <td className="py-3 px-6">
                    <button className="bg-green text-white py-1 px-3 rounded-lg" disabled>
                      Victory
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}; */
