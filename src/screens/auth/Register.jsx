import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Caption, Container, CustomNavLink, PrimaryButton, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { register, RESET } from "../../redux/slide/authSlide";
import { Oval } from "react-loader-spinner";
import axios from "axios";
import clsx from "clsx";
import { removeVietnameseAccents } from "../../utils/helper";


const inittialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  address: "",
}
export const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(inittialState)
  const { name, email, password, confirmPassword, phone } = formData

  const { isRegister, message, isError, isLoading } = useSelector(state => state.auth)

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");



  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('All fields are required')
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    if (password !== confirmPassword) {
      return toast.error('Password does not match')
    }
    const address = removeVietnameseAccents(addressDetail)

    const userData = { name, email, password, address, phone }

    dispatch(register(userData))

  }



  useEffect(() => {
    if (isRegister) {
      navigate("/login")
    }

    if (isError) {
      toast.error(message || 'Registration failed')
    }

    return () => {
      dispatch(RESET())
    }
  }, [dispatch, isRegister, isError, message, navigate])

  // Lấy danh sách tỉnh/thành
  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(response => setProvinces(response.data))
      .catch(error => console.error("Lỗi khi lấy danh sách tỉnh:", error));
  }, []);

  useEffect(() => {
    const newAddress = `${wardName ? wardName + ", " : ""}${districtName ? districtName + ", " : ""}${provinceName}`;

    // Nếu người dùng đã nhập thêm dữ liệu, giữ lại nội dung nhập vào
    setAddressDetail((prev) => (prev.includes(newAddress) ? prev : newAddress));
  }, [provinceName, districtName, wardName]);

  if (isLoading) {
    return (
      <Oval
        visible={true}
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    )
  }

  // Khi chọn tỉnh, lấy danh sách huyện
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    const province = provinces.find(p => p.code === Number(provinceCode));
    setProvinceName(province?.name || "");

    if (provinceCode) {
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        setDistricts(response.data.districts);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách huyện:", error);
      }
    }
  };

  // Khi chọn huyện, lấy danh sách xã/phường
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setWards([]);

    const district = districts.find(d => d.code === Number(districtCode));
    setDistrictName(district?.name || "");

    if (districtCode) {
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        setWards(response.data.wards);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xã/phường:", error);
      }
    }
  };

  // Khi chọn xã/phường
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);

    const ward = wards.find(w => w.code === Number(wardCode));
    setWardName(ward?.name || "");
  };


  const handleAddressChange = (e) => {
    setAddressDetail(e.target.value);
  };


  return (
    <>
      <section className="regsiter pt-16 relative">
        <div className="bg-green w-96 h-96 rounded-full opacity-20 blur-3xl absolute top-2/3"></div>
        <div className="bg-[#241C37] pt-8 h-[40vh] relative content">
          <Container>
            <div>
              <Title level={3} className="text-white">
                Sign Up
              </Title>
              <div className="flex items-center gap-3">
                <Title level={5} className="text-green font-normal text-xl">
                  Home
                </Title>
                <Title level={5} className="text-white font-normal text-xl">
                  /
                </Title>
                <Title level={5} className="text-white font-normal text-xl">
                  Sign Up
                </Title>
              </div>
            </div>
          </Container>
        </div>
        <form onSubmit={handleRegister} className="bg-white shadow-s3 w-1/3 m-auto my-16 p-8 rounded-xl">
          <div className="text-center">
            <Title level={5}>Sign Up</Title>
            <p className="mt-2 text-lg">
              Do you already have an account? <CustomNavLink href="/login">Log In Here</CustomNavLink>
            </p>
          </div>
          <div className="py-2">
            <Caption className="mb-2">Username *</Caption>
            <input type="text" name="name" value={name} onChange={handleInputChange} className={commonClassNameOfInput} placeholder="First Name" />
          </div>
          <div className="py-2">
            <Caption className="mb-2">Enter Your Email *</Caption>
            <input type="email" name="email" value={email} onChange={handleInputChange} className={commonClassNameOfInput} placeholder="Enter Your Email" />
          </div>
          <div className="py-2 font-[500] text-gray_100">
            <label>Province/City:</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className={clsx(commonClassNameOfInput)}
            >
              <option value="">-- Select province/city--</option>
              {provinces.map(province => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>

            <label>District:</label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedProvince}
              className={clsx(commonClassNameOfInput)}
            >
              <option value="">-- Select District --</option>
              {districts.map(district => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>

            <label>Commune/Ward:</label>
            <select
              value={selectedWard}
              onChange={handleWardChange}
              disabled={!selectedDistrict}
              className={clsx(commonClassNameOfInput)}
            >
              <option value="">-- Select Commune/Ward --</option>
              {wards.map(ward => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>

          </div>

          <div className="py-2">
            <Caption className="mb-2">Address Detail</Caption>
            <textarea
              name="address"
              value={addressDetail}
              onChange={handleAddressChange}
              className={commonClassNameOfInput}
              placeholder="Enter detailed address (house number, street...)"
            />
          </div>


          <div>
            <Caption className="mb-2">Number Phone *</Caption>
            <input type="number" name="phone" value={phone} onChange={handleInputChange} className={commonClassNameOfInput} placeholder="Enter Your Password" />
          </div>
          <div>
            <Caption className="mb-2">Password *</Caption>
            <input type="password" name="password" value={password} onChange={handleInputChange} className={commonClassNameOfInput} placeholder="Enter Your Password" />
          </div>
          <div>
            <Caption className="mb-2">Confirm Password *</Caption>
            <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleInputChange} className={commonClassNameOfInput} placeholder="Confirm password" />
          </div>
          <div className="flex items-center gap-2 py-4">
            <input type="checkbox" />
            <Caption>I agree to the Terms & Policy</Caption>
          </div>
          <PrimaryButton className="w-full rounded-none my-5">CREATE ACCOUNT</PrimaryButton>
          <div className="text-center border py-4 rounded-lg mt-4">
            <Title>OR SIGN UP WITH</Title>
            <div className="flex items-center justify-center gap-5 mt-5">
              <button className="flex items-center gap-2 bg-red-500 text-white p-3 px-5 rounded-sm">
                <FaGoogle />
                <p className="text-sm">SIGNUP WHIT GOOGLE</p>
              </button>
              <button className="flex items-center gap-2 bg-indigo-500 text-white p-3 px-5 rounded-sm">
                <FaFacebook />
                <p className="text-sm">SIGN UP WITH FACEBOOK</p>
              </button>
            </div>
          </div>
          <p className="text-center mt-5">
            By clicking the signup button, you create a Cobiro account, and you agree to Cobiros <span className="text-green underline">Terms & Conditions</span> &
            <span className="text-green underline"> Privacy Policy </span> .
          </p>
        </form>
        <div className="bg-green w-96 h-96 rounded-full opacity-20 blur-3xl absolute bottom-96 right-0"></div>
      </section>
    </>
  );
};
