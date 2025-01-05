import React, { useEffect, useState } from 'react';
import usePanigation from '../../../utils/hook/usePanagation';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { getAllProduct } from '../../../redux/slide/productSlide';

const Pagination = ({ listItem, to, methodCallApi, tosearch }) => {
  // console.log(listItem);

  // const { products } = useSelector(state => state.product)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const [paginate, setPaginate] = useState({
    page: currentPage,
    size: process.env.REACT_APP_SIZE_ELEMENT,
  })

  //con log ra nhìu lần 
  // console.log(paginate);

  const totalElements = listItem?.totalElements || 0;
  const pagination = usePanigation(totalElements, currentPage)
  useEffect(() => {
    if (typeof methodCallApi === 'function') {
      dispatch(methodCallApi(paginate));
    }
  }, [dispatch, paginate, methodCallApi])


  const handleClickPage = page => {
    // const urlStart = to.split("?")[0] + "?" + to.split("?")[1]  ///search?name=""
    // const urlEnd = to.split("?")[1].split("=")[0] + "="   //name=

    if (!Number.isInteger(page)) return;
    setPaginate(prev => ({ ...prev, page }))
    // if (urlEnd === "name=") {
    //   navigate(`${urlStart}&page=${page}`);
    // } else {
    // }
    if (tosearch) {
      navigate(`${tosearch}&page=${page}`);
    }
    if (to) {
      navigate(`${to}?page=${page}`);
    }
  }

  return (
    <div className="flex items-center">
      {pagination?.map(el => (
        <div
          key={el}
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


export default Pagination;