import React, { useEffect, useRef, useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { PiPlus } from "react-icons/pi";
import { TiEyeOutline } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { createProduct, getAllProductByBuyer, getAllProductByCreator, } from '../redux/slide/productSlide';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { checkout } from '../service/apiService';
import clsx from 'clsx';
import { CategoryDropDown, PrimaryButton, Caption } from '../router';
import { validateForm } from '../utils/validation';
import { commonClassNameOfInput } from './common/Design';
const initialState = {
  item_name: "",
  description: "",
  starting_price: "",
  start_date: "",
  end_date: "",
  // bid_step: "",
  category_id: "",
};
const ManagerPost = () => {
  const dispatch = useDispatch()
  const [clickMenu, setClickMenu] = useState(0)
  const [addNewProductStatus, setAddNewProductStatus] = useState(0)
  // const [exprise, setExprise] = useState([])
  const [isCheck, setIsCheck] = useState([])
  const [isActive, setIsActive] = useState([])
  const [productSoldOut, setProductSoldOut] = useState([])
  const [productExprise, setProductExprise] = useState([])
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState(null);
  const { productsOfCreator, productsOfBuyer } = useSelector(state => state.product)

  const [productValue, setProductValue] = useState(initialState)
  const { item_name, description, starting_price, start_date, end_date, bid_step } = productValue
  const [imageFile, setImageFile] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [invalidFields, setInvalidFields] = useState([])
  const [invlidImages, setInvlidImages] = useState(false)
  const fileInputRef = useRef(null);
  const { categories } = useSelector(state => state.product)


  const listMenu = [
    { name: 'Opening' },
    { name: 'Expired' },
    { name: 'Pending' },
    { name: 'Success bidding' },
    { name: 'Sold' },
  ]
  const [isLogin] = useState(localStorage.getItem('isIntrospect') || false)
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
    if (Array.isArray(productsOfCreator) && productsOfCreator?.length > 0) {
      // const now = moment();
      // const expiredProducts = productsOfCreator.filter(product => moment(product.end_date).isBefore(now));
      const check = productsOfCreator?.filter(product => product.status === true);
      const productExprise = Array.isArray(productsOfCreator)
        ? productsOfCreator?.filter(product => {
          const [year, month, day] = product?.end_date || [];
          if (!year || !month || !day) return false; // Kiểm tra nếu end_date không hợp lệ

          const endDate = new Date(year, month - 1, day);
          return !product.bidding && product.status && endDate <= new Date();
        })
        : [];


      const isactiveProducts = Array.isArray(productsOfCreator) ? productsOfCreator?.filter(product => product.status === false) : [];
      const productsSoldOut = Array.isArray(productsOfCreator) ? productsOfCreator?.filter(product => product.soldout === true) : [];
      // setExprise(expiredProducts);
      setIsCheck(check || []);
      setProductExprise(productExprise || []);
      setIsActive(isactiveProducts || []);
      setProductSoldOut(productsSoldOut || []);
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
    const product = Array.isArray(productsOfBuyer) && productsOfBuyer.length > 0
      ? productsOfBuyer.find(product => product.item_id === id)
      : null; console.log(productsOfBuyer);
    if (product?.bidding?.price) {
      checkout(id, product?.bidding?.price, uniqueOrderId)
        .then((res) => {
          // setUrl(res.data.data?.paymentUrl)
          window.location.href = res.data.data?.paymentUrl
        })
        .catch((err) => console.error(err));
    }
  }

  // add product


  useEffect(() => {
    if (categories.data) {
      const categoryOptions = categories?.data.map((category) => ({
        label: category.category_name,
        value: category.category_id,
      }));

      setSelectedCategory(categoryOptions)
    }
  }, [categories])


  const handleCategoryChange = (e) => {
    setSelectedCategory(e)
    setProductValue({ ...productValue, category_id: e.value })
    // setProductValue(prev => ({ ...prev, category_id: e.value }))
  }
  const handleChangeAuction = (e) => {
    const { name, value } = e.target
    setProductValue({ ...productValue, [name]: value })
  }
  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files)
    } else {
      setImageFile([])
    }
  }

  const handleFileUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImageFile([]); // If no file is selected, reset the state
      setInvlidImages(false); // No invalid images since no file was uploaded
      return;
    }

    const files = e.target.files;
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > maxFileSize) {
        console.warn(`File size too large: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setInvlidImages(true); // Show error if no valid files
      setImageFile([]); // Clear the state if all files are invalid
    } else {
      setInvlidImages(false);
      setImageFile(validFiles); // Store only valid files
    }
  };



  const handleCreateProduct = (e) => {
    e.preventDefault()

    const invalids = validateForm(productValue, setInvalidFields)
    console.log(invalids);

    const formData = new FormData()

    formData.append('item_name', productValue.item_name)
    formData.append('category_id', productValue.category_id)
    formData.append('description', productValue.description)
    formData.append('starting_price', productValue.starting_price)
    formData.append('start_date', productValue.start_date)
    formData.append('end_date', productValue.end_date)
    // formData.append('bid_step', productValue.bid_step)
    formData.append('userId', userId)

    if (imageFile.length > 0) {
      for (let i = 0; i < imageFile.length; i++) {
        formData.append('images', imageFile[i])
      }
      setInvlidImages(false)
    } else {
      setInvlidImages(true)
    }
    if (invalids === 0 && userId && imageFile.length > 0 && isLogin) {
      dispatch(createProduct(formData));
      setProductValue(initialState)
      setImageFile([])
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }
  return (
    // <section className='flex justify-center'>
    //   <div className="bg-white shadow-s3 w-1/2 rounded-xl">
    //     <div className="mt-[90px] w-full ">

    //     </div>
    //   </div>
    // </section>
    <>
      <div className=" flex border-b border-[#e0e0e0]">
        <img className="w-[46px]" alt="" src="https://cdn-icons-png.flaticon.com/512/6596/6596121.png" />
        <div className="flex flex-col ">
          <span className="text-slate-800 font-bold">{userName}</span>
          <span onClick={() => setAddNewProductStatus(1)}
            className="text-[14px] flex items-center text-[#306bd9] cursor-pointer"> <PiPlus /> Add new product </span>
        </div>
      </div>
      {
        addNewProductStatus === 0 && (
          <>
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
            <div className="w-full pl-3 pr-3 overflow-x-auto">
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
                        clickMenu === 1 && (
                          (
                            isCheck?.length > 0 && productExprise?.map((product, index) => (
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
                                  <button className="font-medium text-green" >
                                    Repost
                                  </button>
                                </td>
                              </tr>
                            ))
                          )
                        )
                      }

                      {
                        clickMenu === 0 && (
                          (
                            isActive?.length > 0 && isActive?.slice(0, visibleCountIsActive)?.map((product, index) => (
                              <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                                {/* <td className="px-6 py-4">{(productsbycategory.currentPage - 1) * productsbycategory.pageSize + index + 1}</td> */}
                                <td className="px-6 py-4">{product?.item_name}</td>
                                <td className="px-6 py-4">{product?.starting_price}</td>
                                <td className="px-6 py-4">{!product?.bidding?.price ? product?.starting_price : product?.bidding?.price}</td>
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
                                  <NavLink to={`/product/update/${product?.item_id}`} type="button" className="font-medium text-green">
                                    <CiEdit size={25} />
                                  </NavLink>
                                </td>
                              </tr>
                            ))
                          )
                        )
                      }
                      {
                        clickMenu === 3 && (
                          productsOfBuyer &&
                          productsOfBuyer?.length > 0 &&
                          productsOfBuyer?.filter(product => product?.buyer?.id === userId)?.map((product) => (
                            <tr key={product.item_id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4">{product.item_name}</td>
                              <td className="px-6 py-4">{product.starting_price}</td>
                              <td className="px-6 py-4">{product?.bidding?.price}</td>
                              <td className="px-6 py-4">{moment(product.start_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">{moment(product.end_date).format("DD/MM/YYYY")}</td>
                              <td className="px-6 py-4">
                                {product?.images?.map((img, index) => (
                                  <img key={index} className="w-10 h-10" src={img} alt="Product" />
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
                    <p className="text-[14px]">Product Name: <span className="text-[16px] font-bold">{product.item_name}</span></p>
                    <p className="text-[14px]">Price: <span className="text-[16px] font-bold">{product?.bidding?.price}</span></p>
                    <p className="text-[14px]">Sold Date: <span className="text-[16px] font-bold">{moment(product.end_date).format("DD/MM/YYYY")}</span></p>
                    <p className="text-[14px]">Buyer: <span className="text-[16px] font-bold">{product?.buyer?.name}</span></p>
                    <p className="text-[14px]">Phone Number: <span className="text-[16px] font-bold">{product?.buyer?.phone}</span></p>
                    <p className="text-[14px]">Address: <span className="text-[16px] font-bold">{product?.buyer?.address}</span></p>
                    <p className="text-[14px]">Payment: <span className={clsx("text-[16px] font-bold", product?.paid === false ? "" : "text-red-500")}>{product?.paid === true ? "Da thanh toan" : "Chua thanh toan"}</span></p>
                  </div>
                ))
              }
              {clickMenu === 4 && visibleCountIsActive < isActive.length && (
                <div className="text-center mt-4 pb-1">
                  <button onClick={handleShowMoreisActive} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                    View More
                  </button>
                </div>
              )}
              {clickMenu === 4 && visibleCountIsActive > 5 && (
                <div className="text-center mt-4 pb-1">
                  <button onClick={handleShowLessIsActive} className="px-4 py-0 bg-red-500 text-white rounded-md">
                    Show Less
                  </button>
                </div>
              )}
            </div>

            {/* cho duyet */}
            {clickMenu === 2 && visibleCountIsCheck < isCheck.length && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowMoreisCheck} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                  View More
                </button>
              </div>
            )}
            {clickMenu === 2 && visibleCountIsCheck > 5 && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowLessIsCheck} className="px-4 py-0 bg-red-500 text-white rounded-md">
                  Show Less
                </button>
              </div>
            )}

            {/* dang hien thi */}
            {clickMenu === 0 && visibleCountIsActive < isActive?.length && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowMoreisActive} className="px-4 py-0 bg-blue-500 text-white rounded-md">
                  View More
                </button>
              </div>
            )}
            {clickMenu === 0 && visibleCountIsActive > 5 && (
              <div className="text-center mt-4 pb-1">
                <button onClick={handleShowLessIsActive} className="px-4 py-0 bg-red-500 text-white rounded-md">
                  Show Less
                </button>
              </div>
            )}
          </>
        )
      }
      {
        addNewProductStatus === 1 && (
          <div className="p-3">
            <div className="flex justify-between">
              <h1 className="text-[18px] font-bold">Add new product</h1>
              <button onClick={() => setAddNewProductStatus(0)} className="text-red-500">Cancel</button>
            </div>
            <form onSubmit={handleCreateProduct} encType="multipart/form-data">
              <div className="w-full">
                <Caption className="mb-2">Name *</Caption>
                <input type="text" name="item_name" value={item_name} onChange={handleChangeAuction}
                       className={`${commonClassNameOfInput}`} placeholder="Name"/>
                {
                    invalidFields?.some(el => el.name === "item_name") && productValue.item_name === '' &&
                    <small style={{color: 'red'}}>{invalidFields?.find(el => el.name === "item_name").message}</small>
                }
              </div>
              <div className="py-5">
                <Caption className="mb-2">Category *</Caption>
                <CategoryDropDown
                    value={selectedCategory}
                    options={categories.data?.map((category) => ({
                      label: category.category_name,
                      value: category.category_id,
                    }))}
                    placeholder="Select a category"
                    handleCategoryChange={handleCategoryChange}
                    className={`${commonClassNameOfInput}`}/>
              </div>
              <div className="w-full">
                <Caption className="mb-2">Start price</Caption>
                <input
                    type="number"
                    name="starting_price"
                    value={starting_price}
                    onChange={handleChangeAuction}
                    placeholder="Start price"
                    className={`${commonClassNameOfInput}`}
                />
                {invalidFields?.some(el => el.name === "starting_price") &&
                    <small style={{ color: 'red' }}>
                      {invalidFields?.find(el => el.name === "starting_price").message}
                    </small>
                }
              </div>

              {/*Start date*/}

              {/*
                <div className="w-1/2">
                  <Caption className="mb-2">Start date</Caption>
                  <input onFocus={() => setInvalidFields([])} type="date" name="start_date" value={start_date}
                         onChange={handleChangeAuction} placeholder="Start date"
                         className={`${commonClassNameOfInput}`}/>
                  {
                      invalidFields?.some(el => el.name === "start_date") &&
                      <small style={{ color: 'red' }}>
                        {invalidFields?.find(el => el.name === "start_date").message}
                      </small>
                  }
                </div>
                */
              }
              <div className="flex items-center gap-5 my-4">
                {/* <div className="w-1/2">
                  <Caption className="mb-2">Bid step</Caption>
                  <input type="number" name="bid_step" value={bid_step} onChange={handleChangeAuction} placeholder="Bid step" className={commonClassNameOfInput} />
                  {
                    invalidFields?.some(el => el.name === "bid_step") &&
                    <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "bid_step").message}</small>
                  }
                </div> */}
                {/*<div className="w-full">*/}
                {/*  <Caption className="mb-2">End date </Caption>*/}
                {/*  <input onFocus={() => setInvalidFields([])} type="date" name="end_date" value={end_date}*/}
                {/*         onChange={handleChangeAuction} placeholder="End date" className={`${commonClassNameOfInput}`}/>*/}
                {/*  {*/}
                {/*      invalidFields?.some(el => el.name === "end_date") &&*/}
                {/*      <small style={{color: 'red'}}>{invalidFields?.find(el => el.name === "end_date").message}</small>*/}
                {/*  }*/}
                {/*</div>*/}
              </div>

              <div>
                <Caption className="mb-2">Description *</Caption>
                <textarea name="description" value={description} onChange={handleChangeAuction}
                          className={`${commonClassNameOfInput}`} cols="30" rows="5"></textarea>
                {
                    invalidFields?.some(el => el.name === "description") && productValue.description === '' &&
                    <small style={{color: 'red'}}>{invalidFields?.find(el => el.name === "description").message}</small>
                }
              </div>
              <div className="flex items-center gap-5 my-4">
                {/* Image Upload */}
                <div className="w-1/2">
                  <Caption className="mb-2">Upload Product Image</Caption>
                  <input
                      type="file"
                      multiple="multiple"
                      accept="image/*"
                      onChange={handleImagesChange}
                      className={`${commonClassNameOfInput}`}
                      name="images"
                      ref={fileInputRef}
                  />
                  {invlidImages && <small style={{color: "red"}}>This field is invalid</small>}
                </div>

                {/* File Upload (PDF) */}
                <div className="w-1/2">
                  <Caption className="mb-2">Upload Certification (PDF)</Caption>
                  <input
                      type="file"
                      multiple
                      accept="file/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                  />
                  {invlidImages && <small style={{ color: 'red' }}>Invalid image file(s). Please upload valid images.</small>}
                </div>
              </div>

              {
                  isLogin &&
                  <PrimaryButton type="submit" className="rounded-none my-5">
                    CREATE
                  </PrimaryButton>
              }
            </form>
          </div>
          )
      }
    </>
  );
};

export default ManagerPost;