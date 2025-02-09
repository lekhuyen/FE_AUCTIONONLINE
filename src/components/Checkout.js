import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from '../utils/axios'
import { checkout } from "../service/apiService";

const Checkout = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [url, setUrl] = useState("");

  const getProduct = async () => {
    try {
      const response = await axios.get(`auction/${id}`,
        { authRequired: true },
      )
      // console.log(response);

      if (response.code === 0) {
        setProduct(response.result)
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getProduct()
  }, [id])

  useEffect(() => {
    const uniqueOrderId = `order_${id}_${Date.now()}`;
    if (product?.bidding?.price) {
      checkout(id, product?.bidding?.price, uniqueOrderId)
        .then((res) => {
          setUrl(res.data.data?.paymentUrl)
        })
        .catch((err) => console.error(err));
    }
  }, [product]);

  const handleCheckout = (e) => {
    if (!url) {
      alert("Lỗi: Chưa có URL thanh toán.");
      return;
    }
    window.location.href = url;
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="mt-[300px]">
      <h2>Checkout</h2>
      <p><strong>Product:</strong> {product?.item_name}</p>
      <p><strong>Price:</strong> {product?.bidding?.price} VND</p>

      <button onClick={handleCheckout}>Proceed to Payment</button>
    </div>
  );
};

export default Checkout;