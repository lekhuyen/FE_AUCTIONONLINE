import React, { useEffect, useState } from 'react';
import usePanigation from '../../../utils/hook/usePanagation';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllProduct } from '../../../redux/slide/productSlide';

const Pagination = () => {
  const { products } = useSelector(state => state.product)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const [paginate, setPaginate] = useState({
    page: currentPage,
    size: process.env.REACT_APP_SIZE_ELEMENT
  })
  const totalElements = products?.totalElements || 0;
  const pagination = usePanigation(totalElements, currentPage)

  useEffect(() => {
    dispatch(getAllProduct(paginate))
  }, [dispatch, paginate])

  const handleClickPage = page => {
    if (!Number.isInteger(page)) {
      return
    }

    setPaginate(prev => ({ ...prev, page }))
    navigate(`/product/admin?page=${page}`);
  }

  return (
    <div className="flex items-center">
      {pagination?.map(el => (
        <div
          onClick={() => handleClickPage(el)}
          className={`w-10 h-10 flex items-center cursor-pointer justify-center 
          hover:bg-gray-300 hover:rounded-full 
          ${currentPage === el && "bg-gray-300 rounded-full"}
          `}>
          {el}
        </div>
      ))}
    </div>
  );
};
{/* <PagiItem key={el}>
  {el}
</PagiItem> */}

export default Pagination;