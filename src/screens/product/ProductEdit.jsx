import { PrimaryButton, Caption, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from '../../utils/axios'
import { jwtDecode } from "jwt-decode";
import { validateForm } from "../../utils/validation";
import { updateProduct } from "../../redux/slide/productSlide";
import { useLoginExpired } from "../../utils/helper";

export const ProductEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [productUpdate, setProductUpdate] = useState({})
  const [userId, setUserId] = useState(null);
  const [imageFile, setImageFile] = useState([]);

  const [invalidFields, setInvalidFields] = useState([])
  const [invlidImages, setInvlidImages] = useState(false)
  const [isLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  useEffect(() => {
    const getProduct = async () => {
      if (isLogin) {
        try {
          const response = await axios.get(`auction/${id}`,
            { authRequired: true },
          )
          if (response.code === 0) {
            const product = {
              item_id: response.result.item_id,
              item_name: response.result.item_name,
              description: response.result.description,
              starting_price: response.result.starting_price,
              start_date: response.result.start_date,
              end_date: response.result.end_date,
              bid_step: response.result.bid_step,
            }
            setImageFile(response.result.images)
            setProductUpdate(product)
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        triggerLoginExpired()
      }
    }
    getProduct()
  }, [id, isLogin, dispatch, navigate, triggerLoginExpired])



  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(Array.from(e.target.files)) // Chuyển FileList thành mảng
    } else {
      setImageFile([])
    }
  }


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

  const handleUpdateProduct = (e) => {
    e.preventDefault()

    const invalids = validateForm(productUpdate, setInvalidFields)

    const formData = new FormData()

    formData.append('item_id', productUpdate.item_id)
    formData.append('item_name', productUpdate.item_name)
    formData.append('description', productUpdate.description)
    formData.append('starting_price', productUpdate.starting_price)
    formData.append('start_date', productUpdate.start_date)
    formData.append('end_date', productUpdate.end_date)
    formData.append('bid_step', productUpdate.bid_step)
    formData.append('userId', userId)


    if (imageFile.length > 0) {
      for (let i = 0; i < imageFile.length; i++) {
        formData.append('images', imageFile[i])
      }
      setInvlidImages(false)
    } else {
      setInvlidImages(true)
    }
    if (invalids === 0 && userId && imageFile.length > 0) {
      dispatch(updateProduct(formData));
      setImageFile([])
      setProductUpdate({
        item_id: "",
        item_name: "",
        description: "",
        starting_price: "",
        start_date: "",
        end_date: "",
        bid_step: "",
      })
    }
  }


  return (
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className=" font-normal mb-5">
          Update Product
        </Title>
        <hr className="my-5" />
        <form onSubmit={handleUpdateProduct} encType="multipart/form-data">

          <input type="text" name="item_id" hidden value={productUpdate.item_id}
            className={`${commonClassNameOfInput}`} />
          <div className="w-full">

            <Caption className="mb-2">Name *</Caption>
            <input type="text" name="item_name" value={productUpdate.item_name}
              onChange={(e) => {
                setProductUpdate(prev => ({ ...prev, item_name: e.target.value }))
              }}
              className={`${commonClassNameOfInput}`} />
            {
              invalidFields?.some(el => el.name === "item_name") && productUpdate.item_name === '' &&
              <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "item_name").message}</small>
            }
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Start price </Caption>
              <input type="number" name="starting_price" value={productUpdate.starting_price} onChange={(e) => {
                setProductUpdate(prev => ({ ...prev, starting_price: e.target.value }))
              }}
                className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "starting_price") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "starting_price").message}</small>
              }
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">Start date </Caption>
              <input onFocus={() => setInvalidFields([])} type="date" name="start_date" value={productUpdate.start_date}
                onChange={(e) => {
                  setProductUpdate(prev => ({ ...prev, start_date: e.target.value }))
                }}
                className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "start_date") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "start_date").message}</small>
              }
            </div>
          </div>
          <div className="flex items-center gap-5 my-4">
            <div className="w-1/2">
              <Caption className="mb-2">Bid step</Caption>
              <input type="number" name="bid_step" value={productUpdate.bid_step}
                onChange={(e) => {
                  setProductUpdate(prev => ({ ...prev, bid_step: e.target.value }))
                }}
                className={commonClassNameOfInput} />
              {
                invalidFields?.some(el => el.name === "bid_step") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "bid_step").message}</small>
              }
            </div>
            <div className="w-1/2">
              <Caption className="mb-2">End date </Caption>
              <input onFocus={() => setInvalidFields([])} type="date" name="end_date" value={productUpdate.end_date}
                onChange={(e) => {
                  setProductUpdate(prev => ({ ...prev, end_date: e.target.value }))
                }}
                className={`${commonClassNameOfInput}`} />
              {
                invalidFields?.some(el => el.name === "end_date") &&
                <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "end_date").message}</small>
              }
            </div>
          </div>
          <div>
            <Caption className="mb-2">Description *</Caption>
            <textarea name="description" value={productUpdate.description}
              onChange={(e) => {
                setProductUpdate(prev => ({ ...prev, description: e.target.value }))
              }}
              className={`${commonClassNameOfInput}`} cols="30" rows="5"></textarea>
            {
              invalidFields?.some(el => el.name === "description") && productUpdate.description === '' &&
              <small style={{ color: 'red' }}>{invalidFields?.find(el => el.name === "description").message}</small>
            }
          </div>
          <div>
            <Caption className="mb-2">Image </Caption>
            <input type="file" multiple="multiple" onChange={handleImagesChange} className={`${commonClassNameOfInput}`} name="images" />
            {
              invlidImages &&
              <small style={{ color: 'red' }}>This fields is invalid</small>
            }
          </div>
          <div>
            <Caption className="mb-2">Current Image </Caption>
            <div className="flex gap-2">
              {
                Array.isArray(imageFile) &&
                imageFile?.map((img, index) => {
                  const imgSrc = img instanceof File ? URL.createObjectURL(img) : img;
                  return <img key={index} className="w-10 h-10" src={imgSrc} alt="Jeseimage" />
                })}
            </div>
          </div>
          {
            isLogin &&
            <PrimaryButton type="submit" className="rounded-none my-5">
              UPDATE
            </PrimaryButton>
          }
        </form>
      </section>
    </>
  );
};
