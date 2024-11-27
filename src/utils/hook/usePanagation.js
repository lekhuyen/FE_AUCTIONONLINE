import { useMemo } from "react"
import { generateRange } from "../helper"
import { RxDotsHorizontal } from "react-icons/rx";


const usePanigation = (totalProductCount, currentPage, siblingCount = 1) => {
  const paginationArray = useMemo(() => {
    //so luong item muon lay
    const pageSize = process.env.REACT_APP_SIZE_ELEMENT || 3

    //so luong page
    const paginationCount = Math.ceil(totalProductCount / +pageSize)

    const totalPaginationItem = siblingCount + 5
    if (paginationCount <= totalPaginationItem) return generateRange(1, paginationCount)

    const isShowLeft = currentPage - siblingCount > 2
    const isShowRight = currentPage + siblingCount < paginationCount - 1

    if (isShowLeft && !isShowRight) {
      // console.log("19");
      const rightStart = paginationCount - 4
      const rightRange = generateRange(rightStart, paginationCount)

      return [1, <RxDotsHorizontal />, ...rightRange]
    }

    if (!isShowLeft && isShowRight) {
      // console.log("29");
      const leftRange = generateRange(1, 5)

      return [...leftRange, <RxDotsHorizontal />, paginationCount]
    }

    const siblingLeft = Math.max(currentPage - siblingCount, 1)
    const siblingRight = Math.min(currentPage + siblingCount, paginationCount)

    if (isShowLeft && isShowRight) {
      // console.log("37");
      const middleRange = generateRange(siblingLeft, siblingRight)
      return [1, <RxDotsHorizontal />, ...middleRange, <RxDotsHorizontal />, paginationCount]
    }

  }, [totalProductCount, currentPage, siblingCount])

  return paginationArray
}

export default usePanigation

// [1,2,3,4,5]
// [1,..,5,6,7,8]
// [1,2,3,4,5,...10]
// [1,..,4,5,7,...10]