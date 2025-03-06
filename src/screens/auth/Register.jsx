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

  //Term
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // Track whether terms are shown

  const [showModal, setShowModal] = useState(false); // State for showing Terms modal


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

    if (!agreedToTerms) {
      return toast.error("You must agree to the Terms and Conditions!");
    }
    const address = removeVietnameseAccents(addressDetail)

    const userData = { name, email, password, address, phone }

    dispatch(register(userData))

  }

  const handleTermsToggle = () => {
    setShowModal(!showModal);
  };

  const handleCheckboxChange = (e) => {
    e.preventDefault(); // Prevent any default behavior
    setAgreedToTerms(e.target.checked);
  };

  const TermsAndConditionsModal = () => (
      <div className="modal-overlay">
        <div className="modal-content">
          <header>
            <button onClick={handleTermsToggle} className="close-btn">×</button>
            <h1>Terms & Conditions</h1>
          </header>
          <div className="modal-body">
            <TermsAndConditionsPage /> {/* This should show the full terms */}

            {/* Checkbox inside modal */}
            <div className="py-2 flex items-center">
              <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={handleCheckboxChange}
              />
              <span className="ml-2">I agree to the Terms & Conditions</span>
            </div>
          </div>
          <footer>
            <button onClick={handleTermsToggle}>Close</button>
          </footer>
        </div>
      </div>
  );

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

  useEffect(() => {
    if (showTerms) {
      // Lock scroll when the modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scroll when the modal is closed
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto'; // Reset to default when the component is unmounted
    };
  }, [showTerms]);

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
            <input type="text" name="name" value={name} onChange={handleInputChange} className={commonClassNameOfInput}
                   placeholder="First Name"/>
          </div>
          <div className="py-2">
            <Caption className="mb-2">Enter Your Email *</Caption>
            <input type="email" name="email" value={email} onChange={handleInputChange}
                   className={commonClassNameOfInput} placeholder="Enter Your Email"/>
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
            <input type="number" name="phone" value={phone} onChange={handleInputChange}
                   className={commonClassNameOfInput} placeholder="Enter Your Password"/>
          </div>
          <div>
            <Caption className="mb-2">Password *</Caption>
            <input type="password" name="password" value={password} onChange={handleInputChange}
                   className={commonClassNameOfInput} placeholder="Enter Your Password"/>
          </div>
          <div>
            <Caption className="mb-2">Confirm Password *</Caption>
            <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleInputChange}
                   className={commonClassNameOfInput} placeholder="Confirm password"/>
          </div>

          {/* Link to open Terms Modal */}
          <div className="py-2 text-center">
            <button
                type="button"
                onClick={handleTermsToggle}
                className="text-blue-600 hover:underline"
            >
              View Terms & Conditions
            </button>
          </div>

          <PrimaryButton className="w-full rounded-none my-5" disabled={!agreedToTerms}>
            CREATE ACCOUNT
          </PrimaryButton>

          <div className="text-center border py-4 rounded-lg mt-4">
            <Title>OR SIGN UP WITH</Title>
            <div className="flex items-center justify-center gap-5 mt-5">
              <button className="flex items-center gap-2 bg-red-500 text-white p-3 px-5 rounded-sm">
                <FaGoogle />
                <p className="text-sm">SIGNUP WHIT GOOGLE</p>
              </button>
              <button className="flex items-center gap-2 bg-indigo-500 text-white p-3 px-5 rounded-sm">
                <FaFacebook/>
                <p className="text-sm">SIGN UP WITH FACEBOOK</p>
              </button>
            </div>
          </div>
          <p className="text-center mt-5">
            By clicking the signup button, you create a Biddora account, and you agree to Biddora <span className="text-green underline">Terms & Conditions</span> &
            <span className="text-green underline"> Privacy Policy </span> .
          </p>
        </form>
        <div className="bg-green w-96 h-96 rounded-full opacity-20 blur-3xl absolute bottom-96 right-0"></div>
        {showModal && <TermsAndConditionsModal />}
      </section>

      {/* Modal Styles */}

      {/* Modal Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-width: 600px;
          max-height: 70%;
          overflow-y: auto;
        }

        .modal-content header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-content footer {
          text-align: right;
          margin-top: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .modal-body {
          padding: 10px;
        }

        .modal-body h2 {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }

        .modal-body p {
          font-size: 16px;
          margin-top: 10px;
        }
      `}</style>
    </>
  );

};


const TermsAndConditionsPage = () => {
  return (
      <div style={{fontFamily: 'Arial, sans-serif'}}>
        <div style={{ padding: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Terms & Conditions</h2>
            <p style={{ fontSize: '16px', marginTop: '20px' }}>
              By using this application, you agree to the terms and conditions set forth in this document.
              Please read them carefully before using the services provided by us.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              1. Introduction
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              By using this application, you agree to the terms and conditions set forth in this document.
              Please read them carefully before using the services provided by us.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              2. User Responsibilities
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              You are responsible for maintaining the confidentiality of your account and password, and for all activities
              that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              3. Privacy Policy
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              We value your privacy. Your personal information will only be used in accordance with our privacy policy, which
              is available on our website.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              4. Limitations of Liability
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              We are not liable for any damages or losses that result from your use of the application, including but not limited
              to financial loss, reputational damage, or legal issues.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              5. Amendments
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              We reserve the right to amend these terms at any time. Any changes will be effective immediately upon posting on
              this page. You are responsible for reviewing these terms periodically.
            </p>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
              6. Contact Us
            </h3>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              If you have any questions or concerns about our Terms & Conditions, please contact us at support@example.com.
            </p>
          </div>
        </div>
      </div>
  );
};
