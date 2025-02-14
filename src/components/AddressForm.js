import { useEffect, useState } from "react";
import axios from "axios";

const AddressForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  // Lấy danh sách tỉnh/thành
  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(response => setProvinces(response.data))
      .catch(error => console.error("Lỗi khi lấy danh sách tỉnh:", error));
  }, []);

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

  return (
    <div className="mt-[400px]">
      <h2>Chọn địa chỉ</h2>

      {/* Chọn tỉnh/thành phố */}
      <label>Tỉnh/Thành phố:</label>
      <select value={selectedProvince} onChange={handleProvinceChange}>
        <option value="">-- Chọn tỉnh/thành phố --</option>
        {provinces.map(province => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </select>

      {/* Chọn huyện/quận */}
      <label>Huyện/Quận:</label>
      <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
        <option value="">-- Chọn huyện/quận --</option>
        {districts.map(district => (
          <option key={district.code} value={district.code}>
            {district.name}
          </option>
        ))}
      </select>

      {/* Chọn xã/phường */}
      <label>Xã/Phường:</label>
      <select value={selectedWard} onChange={handleWardChange} disabled={!selectedDistrict}>
        <option value="">-- Chọn xã/phường --</option>
        {wards.map(ward => (
          <option key={ward.code} value={ward.code}>
            {ward.name}
          </option>
        ))}
      </select>

      {/* Hiển thị kết quả */}
      {provinceName && districtName && wardName && (
        <p>
          <strong>Địa chỉ đã chọn:</strong> {wardName}, {districtName}, {provinceName}
        </p>
      )}
    </div>
  );
};

export default AddressForm;
