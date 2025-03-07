import { useEffect, useState } from "react";
import { getFollowedAuctioneers, unfollowAuctioneer, getFavoriteItems, removeFavoriteItem, getFollowersCount } from "./api";
import { useNavigate } from "react-router-dom";
//import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap

const MyFavorites = () => {

  const [followedSellers, setFollowedSellers] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]); // ✅ Thêm state lưu sản phẩm yêu thích
  const [followersCounts, setFollowersCounts] = useState({}); // ✅ Lưu số lượng người theo dõi từng người bán

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      let storedUserId = localStorage.getItem("userId");

      if (!storedUserId) {
        console.error("❌ Không tìm thấy userId trong LocalStorage!");
        return;
      }

      console.log("📌 Gửi request lấy danh sách yêu thích với userId:", storedUserId);
      try {
        const itemsData = await getFavoriteItems(storedUserId);
        console.log("📥 Danh sách sản phẩm yêu thích:", itemsData);
        setFavoriteItems(itemsData || []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
      }
    };

    fetchData();
  }, []);





  // Hàm hủy follow
  const handleUnfollow = async (sellerId) => {
    const storedUserId = localStorage.getItem("userId");
    const response = await unfollowAuctioneer(storedUserId, sellerId);
    if (response) {
      setFollowedSellers(followedSellers.filter((seller) => seller.id !== sellerId));
      alert("You have unfollowed!");
    }
  };

  // ✅ Hàm hủy yêu thích sản phẩm
  const handleRemoveFavorite = async (itemId) => {
    const storedUserId = localStorage.getItem("userId");
    const response = await removeFavoriteItem(storedUserId, itemId);
    if (response) {
      setFavoriteItems(favoriteItems.filter((item) => item.id !== itemId));
      alert("Product has been removed from wishlist!");
    }
  };

  return (
    <div className="favorites-page">

      {/* ✅ Bảng 1: Danh Sách Người Bán Đã Follow */}
      <h2>Seller has been following</h2>
      {followedSellers.length === 0 ? (
        <p className="empty-message">You are not following any sellers yet.</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {followedSellers.map((seller) => (
              <tr key={seller.id}>
                <td>{seller.name}</td>
                <td>{seller.phone}</td>
                <td>{seller.location}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleUnfollow(seller.id)}>
                    ❌ Unfollow
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {/* ✅ Bảng 2: Danh Sách Sản Phẩm Yêu Thích */}
      <h1>Favorite products</h1>
      {favoriteItems.length === 0 ? (
        <p className="empty-message">You have not liked any products yet.</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name item</th>
              <th>Price</th>
              <th>Current price</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {favoriteItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.imageUrl} alt={item.name} className="favorite-item-img" />
                </td>
                <td>{item.name}</td>
                <td>${item.startingPrice}</td>
                <td>${item.currentPrice}</td>
                <td>{item.description}</td>
                <td>
                  <button className="btn-info" onClick={() => navigate(`/details/${item.id}`)}>
                    🔍 View Details
                  </button>
                  <button className="btn-danger" onClick={() => handleRemoveFavorite(item.id)}>
                    ❌ Delete Favorite
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ CSS Styles */}
      <style>
        {`

    const [followedSellers, setFollowedSellers] = useState([]);
    const [favoriteItems, setFavoriteItems] = useState([]); // ✅ Thêm state lưu sản phẩm yêu thích
    const [followersCounts, setFollowersCounts] = useState({}); // ✅ Lưu số lượng người theo dõi từng người bán
  
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            let storedUserId = localStorage.getItem("userId");

            // 🔥 Nếu `userId` bị mất, cố gắng lấy lại từ token
            if (!storedUserId) {
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const tokenInfo = JSON.parse(atob(token.split(".")[1])); // Giải mã JWT
                        storedUserId = tokenInfo.userid;
                        localStorage.setItem("userId", storedUserId); // Lưu lại để không mất nữa
                    } catch (error) {
                        console.error("Lỗi giải mã token:", error);
                    }
                }
            }

            console.log("🔄 Reload trang - Lấy userId:", storedUserId);

            if (storedUserId) {
                // ✅ Lấy danh sách người bán đã follow
                const sellersData = await getFollowedAuctioneers(storedUserId);
                console.log("📥 Danh sách người đã follow:", sellersData);
                setFollowedSellers(sellersData || []);

                // ✅ Lấy danh sách sản phẩm yêu thích
                const itemsData = await getFavoriteItems(storedUserId);
                console.log("📥 Danh sách sản phẩm yêu thích:", itemsData);
                setFavoriteItems(itemsData || []);


                // ✅ Lấy số lượng followers cho từng người bán
                const counts = {};
                for (const seller of sellersData) {
                    counts[seller.id] = await getFollowersCount(seller.id);
                }
                setFollowersCounts(counts);
            }
        };
        fetchData();
    }, []);

    // Hàm hủy follow
    const handleUnfollow = async (sellerId) => {
        const storedUserId = localStorage.getItem("userId");
        const response = await unfollowAuctioneer(storedUserId, sellerId);
        if (response) {
            setFollowedSellers(followedSellers.filter((seller) => seller.id !== sellerId));
            alert("You have unfollowed!");
        }
    };

    // ✅ Hàm hủy yêu thích sản phẩm
    const handleRemoveFavorite = async (itemId) => {
        const storedUserId = localStorage.getItem("userId");
        const response = await removeFavoriteItem(storedUserId, itemId);
        if (response) {
            setFavoriteItems(favoriteItems.filter((item) => item.id !== itemId));
            alert("Product has been removed from wishlist!");
        }
    };

    return (
        <div className="favorites-page">
          <h1 className="title">My Favorites</h1>
    
          {/* ✅ Bảng 1: Danh Sách Người Bán Đã Follow */}
          <h2>Seller has been following</h2>
          {followedSellers.length === 0 ? (
            <p className="empty-message">You are not following any sellers yet.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Followers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {followedSellers.map((seller) => (
                  <tr key={seller.id}>
                    <td>{seller.name}</td>
                    <td>{seller.phone}</td>
                    <td>{seller.location}</td>
                    <td>{followersCounts[seller.id] || 0}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleUnfollow(seller.id)}>
                        ❌ Unfollow
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    
          {/* ✅ Bảng 2: Danh Sách Sản Phẩm Yêu Thích */}
          <h1>Favorite products</h1>
          {favoriteItems.length === 0 ? (
            <p className="empty-message">You have not liked any products yet.</p>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Image</th>    
                  <th>Name item</th>
                  <th>Price</th>
                  <th>Current price</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {favoriteItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.imageUrl} alt={item.name} className="favorite-item-img" />
                    </td>
                    <td>{item.name}</td>
                    <td>${item.startingPrice}</td>
                    <td>${item.currentPrice}</td>
                    <td>{item.description}</td>
                    <td>
                      <button className="btn-info" onClick={() => navigate(`/details/${item.id}`)}>
                        🔍 View Details
                      </button>
                      <button className="btn-danger" onClick={() => handleRemoveFavorite(item.id)}>
                        ❌ Delete Favorite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    
          {/* ✅ CSS Styles */}
          <style>
            {`

              .favorites-page {
                max-width: 1200px;
                margin: auto;
                text-align: center;
              }
    
              .title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 20px;
              }
    
              .empty-message {
                font-style: italic;
                color: gray;
              }
    
              .custom-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                border: 1px solid #ddd;
              }
    
              .custom-table th, .custom-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
    
              .custom-table th {
                background-color: #333;
                color: white;
              }
    
              .custom-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
    
              .custom-table tr:hover {
                background-color: #f1f1f1;
              }
    
              .btn-danger {
                background-color: red;
                color: white;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 5px;
                margin-right: 5px;
              }
    
              .btn-danger:hover {
                background-color: darkred;
              }
    
              .btn-info {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 5px;
                margin-right: 5px;
              }
    
              .btn-info:hover {
                background-color: #0056b3;
              }
    
              .favorite-item-img {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 5px;
              }
            `}

      </style>
    </div>
  );





export default MyFavorites;
