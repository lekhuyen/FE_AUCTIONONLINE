import { CategoryDropDown, Caption, PrimaryButton, Title } from "../../router";
import axios from '../../utils/axios';
import { commonClassNameOfInput } from "../../components/common/Design";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { createProduct } from "../../redux/slide/productSlide";
import { validateForm } from "../../utils/validation";
import { useLoginExpired } from "../../utils/helper";

const initialState = {
  item_id: "",
  item_name: "",
  description: "",
  starting_price: "",
  category_id: "",
  start_date: "",
  end_date: "",
};

export const AddProduct = () => {
  const [userId, setUserId] = useState(null);
  const [productValue, setProductValue] = useState(initialState);
  const { item_name, description, starting_price, start_date, end_date } = productValue
  const [imageFile, setImageFile] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [invalidFields, setInvalidFields] = useState([]);
  const [invlidImages, setInvlidImages] = useState(false);
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false);
  const { triggerLoginExpired } = useLoginExpired();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { categories } = useSelector(state => state.product);
  const [dateError, setDateError] = useState("");

  //FDF
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (categories.data && categories.data.length > 0) {
      const firstCategory = {
        label: categories.data[0].category_name,
        value: categories.data[0].category_id,
      };
      setSelectedCategory(firstCategory);
      setProductValue((prev) => ({ ...prev, category_id: firstCategory.value }));
    }
  }, [categories]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e);
    setProductValue({ ...productValue, category_id: e.value });
  };

  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files);
    } else {
      setImageFile([]);
    }
  };

  const handleChangeAuction = (e) => {
    const { name, value } = e.target;
    setProductValue({ ...productValue, [name]: value });

    // Clear invalid fields when the user focuses on dates
    if (name === "start_date" || name === "end_date") {
      setInvalidFields((prev) => prev.filter((field) => field.name !== name));
      setDateError("");  // Clear date error
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenInfo = jwtDecode(token);
        setUserId(tokenInfo.userid);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }
  }, []);

  const handlePDFChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const fetchUploadedFile = async (auctionItemId) => {
    try {
      const response = await axios.get(`https://be-pjhk4.onrender.com/api/files/auctionItem/${auctionItemId}`, {
        responseType: 'blob' // Important for handling PDF files
      });

      // Convert blob to object URL for preview/download
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      setFileUrl(fileURL);

      console.log("✅ File fetched successfully.");
    } catch (error) {
      console.error("❌ Error fetching file:", error);
    }
  };

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setDateError("Start and end dates are required.");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Start date cannot be after end date.");
      return false;
    }
    setDateError(""); // Clear errors if validation passes
    return true;
  };



  const handleCreateProduct = async (e) => {
    e.preventDefault();
    console.log("🔍 Submitting product data:", productValue);

    try {
      const formData = new FormData();
      formData.append("item_name", productValue.item_name);
      formData.append("category_id", productValue.category_id);
      formData.append("description", productValue.description);
      formData.append('start_date', productValue.start_date)
      formData.append('end_date', productValue.end_date)
      formData.append("starting_price", productValue.starting_price);
      formData.append("userId", userId);

      // Append images
      if (imageFile.length === 0) {
        setInvlidImages(true);
        return;
      } else {
        setInvlidImages(false);
        for (let i = 0; i < imageFile.length; i++) {
          formData.append("images", imageFile[i]);
        }
      }

      // Check for invalid dates before proceeding with submission
      if (!validateDates(start_date, end_date)) {
        setDateError("Start date must be before End date.");
        return; // Prevent form submission
      }

      // Append file uploads
      if (selectedFile) {
        formData.append("fileUploads", selectedFile);
      }

      // ✅ Send API request
      const result = await dispatch(createProduct(formData)).unwrap();

      if (result?.message?.toLowerCase().includes("successfully")) {
        console.log("✅ Auction item created successfully:", result);

        // ✅ Reset form fields
        setProductValue(initialState);
        setImageFile([]);
        setSelectedFile(null);
        setSelectedCategory(null);
        setDateError("");  // Clear date error

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // ✅ Refresh the page
        // setTimeout(() => {
        //   window.location.href = window.location.href;
        // }, 500);
      } else {
        console.error("❌ Failed to create auction item. Response:", result);
      }

    } catch (error) {
      console.error("❌ Error:", error.result?.data || error.message);
    }
  };



  return (
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className="font-normal mb-5">
          Create Product
        </Title>
        <hr className="my-5" />
        <form onSubmit={handleCreateProduct} encType="multipart/form-data">
          <div className="w-full">
            <Caption className="mb-2">Name *</Caption>
            <input
              type="text"
              name="item_name"
              value={item_name}
              onChange={handleChangeAuction}
              className={`${commonClassNameOfInput}`}
              placeholder="Name"
            />
            {invalidFields?.some(el => el.name === "item_name") && productValue.item_name === '' && (
              <small style={{ color: 'red' }}>
                {invalidFields?.find(el => el.name === "item_name").message}
              </small>
            )}
          </div>

          <div className="py-5">
            <Caption className="mb-2">Category *</Caption>
            <CategoryDropDown
              value={selectedCategory}
              options={categories?.data?.map((category) => ({
                label: category.category_name,
                value: category.category_id,
              }))}
              placeholder="Select a category"
              handleCategoryChange={handleCategoryChange}
              className={`${commonClassNameOfInput}`}
            />
          </div>

          <div className="flex items-center gap-5 my-4">
            <div className="w-full">
              <Caption className="mb-2">Start price </Caption>
              <input
                type="number"
                name="starting_price"
                value={starting_price}
                onChange={handleChangeAuction}
                placeholder="Start price"
                className={`${commonClassNameOfInput}`}
              />
              {invalidFields?.some(el => el.name === "starting_price") && (
                <small style={{ color: 'red' }}>
                  {invalidFields?.find(el => el.name === "starting_price").message}
                </small>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <Caption className="mb-2">Start date</Caption>
              <input
                onFocus={() => setInvalidFields([])} // Clear invalid fields when focused
                type="date"
                name="start_date"
                value={start_date}
                onChange={handleChangeAuction}
                placeholder="Start date"
                className={`${commonClassNameOfInput}`}
              />
              {invalidFields?.some((el) => el.name === "start_date") && (
                <small style={{ color: "red" }}>
                  {invalidFields?.find((el) => el.name === "start_date")?.message}
                </small>
              )}
            </div>

            <div className="w-1/2">
              <Caption className="mb-2">End date</Caption>
              <input
                onFocus={() => setInvalidFields([])} // Clear invalid fields when focused
                type="date"
                name="end_date"
                value={end_date}
                onChange={handleChangeAuction}
                placeholder="End date"
                className={`${commonClassNameOfInput}`}
              />
              {invalidFields?.some((el) => el.name === "end_date") && (
                <small style={{ color: "red" }}>
                  {invalidFields?.find((el) => el.name === "end_date")?.message}
                </small>
              )}
              {dateError && <small style={{ color: "red" }}>{dateError}</small>}
            </div>
          </div>


          <div>
            <Caption className="mb-2">Description *</Caption>
            <textarea
              name="description"
              value={description}
              onChange={handleChangeAuction}
              className={`${commonClassNameOfInput}`}
              cols="30"
              rows="5"
            ></textarea>
            {invalidFields?.some(el => el.name === "description") && productValue.description === '' && (
              <small style={{ color: 'red' }}>
                {invalidFields?.find(el => el.name === "description").message}
              </small>
            )}
          </div>

          <div>
            <Caption className="mb-2">Image </Caption>
            <input
              type="file"
              multiple="multiple"
              onChange={handleImagesChange}
              className={`${commonClassNameOfInput}`}
              name="images"
              ref={fileInputRef}
            />
            {invlidImages && <small style={{ color: 'red' }}>This field is invalid</small>}
          </div>

          <div>
            <Caption className="mb-2">PDF File (Optional)</Caption>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePDFChange}
              className={`${commonClassNameOfInput}`}
            />
            {selectedFile && <small style={{ color: 'green' }}>PDF selected: {selectedFile.name}</small>}
          </div>

          {isLogin && (
            <PrimaryButton type="submit" className="rounded-none my-5">
              CREATE
            </PrimaryButton>
          )}
        </form>
      </section>
    </>
  );
};
