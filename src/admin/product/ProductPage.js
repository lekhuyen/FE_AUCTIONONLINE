import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Caption, PrimaryButton, ProfileCard, Title } from '../../router';
import { RiAuctionFill } from 'react-icons/ri';
import { GiTakeMyMoney } from 'react-icons/gi';
import { MdOutlineFavorite } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProductByCategory } from '../../redux/slide/productSlide';
import Pagination from '../../components/common/layout/Pagination';
import axios from '../../utils/axios'


const ProductPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const { productsbycategory } = useSelector(state => state.product)
  const [productsOfCategory, setProductsOfCategory] = useState(null)
  const { productId } = useParams()
  const [prevPagination, setPrevPagination] = useState({ currentPage: 0, pageSize: 0, prevProductId: productId });
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const [paginate, setPaginate] = useState({
    page: currentPage,
    size: process.env.REACT_APP_SIZE_ELEMENT,
    productId
  })

  useEffect(() => {
    setPaginate(prevState => ({
      ...prevState,
      page: currentPage,
      productId,
    }));
  }, [currentPage, productId]);

  useEffect(() => {
    if (productId) {
      const currentPage = productsbycategory?.currentPage;
      const pageSize = productsbycategory?.pageSize;

      if (
        currentPage !== prevPagination.currentPage ||
        pageSize !== prevPagination.pageSize ||
        productId !== prevPagination.productId
      ) {
        dispatch(
          getAllProductByCategory(paginate)
        );
        setPrevPagination({ currentPage, pageSize, productId });
      }
    }
  }, [productId, productsbycategory?.currentPage, productsbycategory?.pageSize, currentPage])


  const timeLeft = Date.now();

  return (
    <div className="w-[85%] m-auto mt-[100px]">
      <div className=" grid grid-cols-1 md:grid-cols-4 gap-8 my-8">
        {
          productsbycategory?.data?.length > 0 && productsbycategory?.data?.map((item, index) => (
            <div key={item.item_id} className="bg-white shadow-s1 rounded-xl p-3 relative">
              {
                timeLeft && (
                  <div className="flex text-center absolute left-[50%] top-[50%] 
              translate-x-[-50%] shadow-lg translate-y-[-70%] w-[150px] h-[30px] 
              z-20 justify-center items-center rounded-2xl bg-white"
                  >
                    {
                      timeLeft?.days && (
                        <div className="">
                          <p>{timeLeft?.days}(d)</p>
                        </div>
                      )
                    }
                    {
                      timeLeft?.hours && (
                        <div className="">
                          <p>{timeLeft?.hours}:</p>
                        </div>
                      )
                    }
                    {
                      timeLeft?.minutes && (
                        <div className="">
                          <p>{timeLeft?.minutes}:</p>
                        </div>
                      )
                    }
                    {
                      timeLeft?.seconds && (
                        <div className="">
                          <p>{timeLeft?.seconds}</p>
                        </div>
                      )
                    }
                  </div>
                )
              }
              <div className="h-56 relative overflow-hidden">
                <NavLink to="#">
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover rounded-xl hover:scale-105 hover:cursor-pointer transition-transform duration-300 ease-in-out" />
                </NavLink>
                <ProfileCard className="shadow-s1 absolute right-3 bottom-3">
                  <RiAuctionFill size={22} className="text-green" />
                </ProfileCard>
                <div className="absolute top-0 left-0 p-2 w-full">
                  <div className="flex items-center justify-between">
                    {item?.soldout === true ? (
                      <Caption className="text-red-500 bg-white px-3 py-1 text-sm rounded-full">Sold Out</Caption>
                    ) : (
                      <Caption className="text-green bg-green_100 px-3 py-1 text-sm rounded-full">On Stock</Caption>
                    )}
                    <Caption className="text-green bg-green_100 px-3 py-1 text-sm rounded-full">123 Bids</Caption>
                  </div>
                </div>
              </div>
              <div className="details mt-4">
                <Title className="uppercase">{item.item_name}</Title>
                <hr className="mt-3" />
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <RiAuctionFill size={40} className="text-green" />
                    </div>
                    <div>
                      <Caption className="text-green">Current Bid</Caption>
                      <Title>${item.starting_price}.00</Title>
                    </div>
                  </div>
                  <div className="w-[1px] h-10 bg-gray-300"> </div>
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <GiTakeMyMoney size={40} className="text-red-500" />
                    </div>
                    <div>
                      <Caption className="text-red-500">Buy Now</Caption>
                      <Title>$2.00</Title>
                    </div>
                  </div>
                </div>
                <hr className="mb-3" />
                <div className="flex items-center  justify-between mt-3">
                  <PrimaryButton className="rounded-lg text-sm">Place Bid</PrimaryButton>
                  <PrimaryButton className="rounded-lg px-4 py-3">
                    <MdOutlineFavorite size={20} />
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      {
        productsbycategory?.data?.length === 0 && (
          <div className="flex m-auto">
            <h2>Khong co san phan nao</h2>
          </div>)
      }
      <div className="mt-8 flex justify-end">
        <Pagination
          listItem={productsbycategory}
          to={`/product-list/${productId}`}
          methodCallApi={getAllProductByCategory}
        />
      </div>
    </div>
  );
};

export default ProductPage;