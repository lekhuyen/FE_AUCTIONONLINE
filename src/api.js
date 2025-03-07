import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/favorites"; // Điều chỉnh nếu cần

// ✅ API lấy số lượng người theo dõi một nhà bán hàng
export const getFollowersCount = async (auctioneerId) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/favorites/get-followers-count/${auctioneerId}`
    );
    return response.data; // Trả về số lượng followers
  } catch (error) {
    console.error("❌ Lỗi khi lấy số lượng followers:", error);
    return 0;
  }
};


// Follow người bán
export const followAuctioneer = async (userId, auctioneerId) => {

  try {
    const response = await axios.post(
      `${API_BASE_URL}/follow-auctioneer`,
      { userId, auctioneerId },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"), // Nếu có xác thực
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi theo dõi người bán:", error);
    return null;
  }
};

export const unfollowAuctioneer = async (userId, auctioneerId) => {
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/favorites/unfollow-auctioneer`,
      {
        params: { userId, auctioneerId },
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy theo dõi người bán:", error);
    return null;
  }
};
export const getFollowedAuctioneers = async (userId) => {

  try {
    const response = await axios.get(
      `http://localhost:8080/api/favorites/get-followed-auctioneers/${userId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người đã follow:", error);
    return [];
  }
};

export const checkIfFollowing = async (userId, auctioneerId) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/favorites/is-following`,
      {
        params: { userId, auctioneerId },
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      }
    );
    return response.data; // Trả về true hoặc false
  } catch (error) {
    console.error("Lỗi khi kiểm tra follow:", error);
    return false;
  }
};  


// ✅ Thêm sản phẩm vào danh sách yêu thích
export const addFavoriteItem = async (userId, itemId) => {

  console.log("📌 Gửi request thêm yêu thích:", { userId, itemId });

  try {
      const response = await axios.post(`http://localhost:8080/api/favorites/add-favorite-item`, 
          null, { params: { userId, itemId } }
      );
      return response.data;
  } catch (error) {
      console.error("❌ Lỗi khi thêm sản phẩm yêu thích:", error);
      throw error;
  }
};

// ✅ Kiểm tra sản phẩm đã được yêu thích chưa
export const checkFavoriteItem = async (userId, itemId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/is-favorite`, {
      params: { userId, itemId },
    });
    return response.data; // Trả về `true` hoặc `false`
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra yêu thích sản phẩm:", error);
    return false;
  }
};

// ✅ Hủy yêu thích sản phẩm
export const removeFavoriteItem = async (userId, itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/remove-favorite-item`, {
      params: { userId, itemId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi hủy yêu thích sản phẩm:", error);
    return null;
  }
};// ✅ Lấy danh sách sản phẩm yêu thích
export const getFavoriteItems = async (userId) => {

  console.log("📌 Gửi request lấy danh sách yêu thích với userId:", userId);

  try {
      const response = await axios.get(`http://localhost:8080/api/favorites/get-favorite-items/${userId}`);
      return response.data;
  } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
      throw error;
  }
};

// ✅ API lấy danh sách bình luận cho sản phẩm
export const getComments = async (auctioneerId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/favorites/get-comments/${auctioneerId}`);
    return response.data; // Trả về danh sách bình luận
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bình luận:", error);
    return [];
  }
};

// ✅ API gửi bình luận
export const addComment = async (userId, auctioneerId, content) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ Chưa có token, yêu cầu đăng nhập!");
    return null; // Nếu không có token, không gửi yêu cầu
  }

  console.log("🔑 Gửi bình luận với dữ liệu:", { userId, auctioneerId, content }); // Kiểm tra giá trị auctioneerId

  try {
    const response = await axios.post(
      `http://localhost:8080/api/favorites/add-comment`,
      {
        userId,
        auctioneerId, // Gửi auctioneerId đúng
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi gửi bình luận:", error);
    return null;
  }
};







