import { CategoryDropDown, Caption, PrimaryButton, Title } from "../../router";
import axios from '../../utils/axios'
import { commonClassNameOfInput } from "../../components/common/Design";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { createProduct } from "../../redux/slide/productSlide";
import { validateForm } from "../../utils/validation";
import { useLoginExpired } from "../../utils/helper";


const initialState = {
  item_name: "",
  description: "",
  starting_price: "",
  start_date: "",
  end_date: "",
  bid_step: "",
  category_id: "",
};

export const AddProduct = () => {
  const [userId, setUserId] = useState(null);
  const [productValue, setProductValue] = useState(initialState)
  const { item_name, description, starting_price, start_date, end_date, bid_step } = productValue
  const [imageFile, setImageFile] = useState([]);
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [invalidFields, setInvalidFields] = useState([])
  const [invlidImages, setInvlidImages] = useState(false)
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  const dispatch = useDispatch()
  const fileInputRef = useRef(null);



  const getCategories = async () => {
    if (isLogin) {
      try {
        const response = await axios.get("category", {
          authRequired: true,
        })
        if (response.code === 0) {
          setCategories(response.result.data)
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      triggerLoginExpired()
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const tokenInfo = jwtDecode(token)
        // setProductValue({ ...productValue, userInfo: tokenInfo.userid })
        setUserId(tokenInfo.userid)
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, [])





  const handleCreateProduct = (e) => {
    e.preventDefault()

    const invalids = validateForm(productValue, setInvalidFields)

    const formData = new FormData()

    formData.append('item_name', productValue.item_name)
    formData.append('category_id', productValue.category_id)
    formData.append('description', productValue.description)
    formData.append('starting_price', productValue.starting_price)
    formData.append('start_date', productValue.start_date)
    formData.append('end_date', productValue.end_date)
    formData.append('bid_step', productValue.bid_step)
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
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className=" font-normal mb-5">
          Create Product
        </Title>
        <hr className="my-5" />
        <form onSubmit={handleCreateProduct} encType="multipart/form-data">
          <div className="w-full">
            <Caption className="mb-2">Name *</Caption>
            <input type="text" name="item_name" value={item_name} onChange={handleChangeAuction} className={`${commonClassNameOfInput}`} placeholder="Name" />
            {
              invalidFields?.some(el => el.name === "item_name") && productValue.item_name === '' &&
              <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "item_name").message}</small>
            }
          </div>
          <div className="py-5">
            <Caption className="mb-2">Category *</Caption>
            <CategoryDropDown
              value={selectedCategory}
              options={categories?.map((category) => ({
                label: category.category_name,
                value: category.category_id,
              }))}
              placeholder="Select a category"
              handleCategoryChange={handleCategoryChange}
              className={`${commonClassNameOfInput}`} />
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Start price </Caption>
              <input type="number" name="starting_price" value={starting_price} onChange={handleChangeAuction} placeholder="Start price" className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "starting_price") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "starting_price").message}</small>
              }
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">Start date </Caption>
              <input onFocus={() => setInvalidFields([])} type="date" name="start_date" value={start_date} onChange={handleChangeAuction} placeholder="Start date" className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "start_date") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "start_date").message}</small>
              }
            </div>
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Bid step</Caption>
              <input type="number" name="bid_step" value={bid_step} onChange={handleChangeAuction} placeholder="Bid step" className={commonClassNameOfInput} />
              {
                invalidFields?.some(el => el.name === "bid_step") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "bid_step").message}</small>
              }
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">End date </Caption>
              <input onFocus={() => setInvalidFields([])} type="date" name="end_date" value={end_date} onChange={handleChangeAuction} placeholder="End date" className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "end_date") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "end_date").message}</small>
              }
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
            {
              invalidFields?.some(el => el.name === "description") && productValue.description === '' &&
              <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "description").message}</small>
            }
          </div>
          <div>
            <Caption className="mb-2">Image </Caption>
            <input type="file"
              multiple="multiple"
              onChange={handleImagesChange}
              className={`${commonClassNameOfInput}`}
              name="images"
              ref={fileInputRef}
            />
            {
              invlidImages &&
              <small style={{ color: 'red' }}>This fields is invalid</small>
            }
          </div>
          {
            isLogin &&
            <PrimaryButton type="submit" className="rounded-none my-5">
              CREATE
            </PrimaryButton>
          }
        </form>
      </section>
    </>
  );
};
