import { CategoryDropDown, Caption, PrimaryButton, Title } from "../../router";
import axios from '../../utils/axios'
import { commonClassNameOfInput } from "../../components/common/Design";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { createProduct } from "../../redux/slide/productSlide";
import { toast } from "react-toastify";

const initialState = {
  item_name: "",
  description: "",
  starting_price: "",
  start_date: "",
  end_date: "",
  bid_step: "",
  userId: "",
  category_id: "",
};

export const AddProduct = () => {
  // const { token } = useSelector(state => state.auth)
  const [userInfo, setUserInfo] = useState(localStorage.getItem('token') || null);
  const [productValue, setProductValue] = useState(initialState)
  const { item_name, description, starting_price, start_date, end_date, bid_step } = productValue
  const [imageFile, setImageFile] = useState([]);
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const dispatch = useDispatch()
  const { message, code, isLoading } = useSelector(state => state.product)

  const getCategories = async () => {
    try {
      const response = await axios.get("category", {
        authRequired: true,
      })

      if (response.code === 0) {
        setCategories(response.result)
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    const categoryOptions = categories.map((category) => ({
      label: category.category_name,
      value: category.category_id,
    }));
    setSelectedCategory(categoryOptions)
  }, [categories])
  useEffect(() => {

    getCategories()
  }, [])

  const handleCategoryChange = (e) => {
    setSelectedCategory(e)
    setProductValue({ ...productValue, category_id: e.value })
    // setProductValue(prev => ({ ...prev, category_id: e.value }))
  }

  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files)
    } else {
      setImageFile([])
    }
  }

  const handleChangeAuction = (e) => {
    const { name, value } = e.target
    setProductValue({ ...productValue, [name]: value })
  }

  const handleCreateProduct = (e) => {
    e.preventDefault()
    if (userInfo) {
      console.log('cos token');

      try {
        const tokenInfo = jwtDecode(userInfo);
        setProductValue(prev => ({ ...prev, userId: tokenInfo.userid }))
        // setProductValue({ ...productValue, userId: tokenInfo.userid })
      } catch (error) {
        console.log(error.message);
      }
    }
    const formData = new FormData()

    formData.append('item_name', productValue.item_name)
    formData.append('category_id', productValue.category_id)
    formData.append('description', productValue.description)
    formData.append('starting_price', productValue.starting_price)
    formData.append('start_date', productValue.start_date)
    formData.append('end_date', productValue.end_date)
    formData.append('bid_step', productValue.bid_step)
    formData.append('userId', productValue.userId)

    for (let i = 0; i < imageFile.length; i++) {
      formData.append('images', imageFile[i])

    }
    dispatch(createProduct(formData));

    if (code === 0) {
      toast.success(message);
      setProductValue(initialState)
      setImageFile([])
    }
  }

  return (
    <>
      {/* <Loading /> */}
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className=" font-normal mb-5">
          Create Product
        </Title>
        <hr className="my-5" />
        <form onSubmit={handleCreateProduct} encType="multipart/form-data">
          <div className="w-full">
            <Caption className="mb-2">Name *</Caption>
            <input type="text" name="item_name" value={item_name} onChange={handleChangeAuction} className={`${commonClassNameOfInput}`} placeholder="Name" />
          </div>
          <div className="py-5">
            <Caption className="mb-2">Category *</Caption>
            <CategoryDropDown
              value={selectedCategory}
              options={categories.map((category) => ({
                label: category.category_name,
                value: category.category_id,
              }))}
              handleCategoryChange={handleCategoryChange}
              className={`${commonClassNameOfInput}`} />
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Start price </Caption>
              <input type="number" name="starting_price" value={starting_price} onChange={handleChangeAuction} placeholder="Start price" className={`${commonClassNameOfInput}`} />
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">Start date </Caption>
              <input type="date" name="start_date" value={start_date} onChange={handleChangeAuction} placeholder="Start date" className={`${commonClassNameOfInput}`} />
            </div>
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Bid step</Caption>
              <input type="text" name="bid_step" value={bid_step} onChange={handleChangeAuction} placeholder="Bid step" className={commonClassNameOfInput} />
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">End date </Caption>
              <input type="date" name="end_date" value={end_date} onChange={handleChangeAuction} placeholder="End date" className={`${commonClassNameOfInput}`} />
            </div>
          </div>
          {/* <div className="flex items-center gap-5 mt-4">
            <div className="w-1/2">
              <Caption className="mb-2">
                Weight of piece <span className=" text-purple-400 italic">(kg)</span>
              </Caption>
              <input type="number" name="weigth" placeholder="weigth" className={`${commonClassNameOfInput}`} />
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">Price Range*</Caption>
              <input type="number" name="price" className={`${commonClassNameOfInput}`} placeholder="Price" required />
            </div>
          </div> */}
          <div>
            <Caption className="mb-2">Description *</Caption>
            <textarea name="description" value={description} onChange={handleChangeAuction} className={`${commonClassNameOfInput}`} cols="30" rows="5"></textarea>
          </div>
          <div>
            <Caption className="mb-2">Image </Caption>
            <input type="file" multiple="multiple" onChange={handleImagesChange} className={`${commonClassNameOfInput}`} name="images" />
          </div>
          <PrimaryButton type="submit" className="rounded-none my-5">
            CREATE
          </PrimaryButton>
        </form>
      </section>
    </>
  );
};
