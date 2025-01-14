import { useSelector } from "react-redux";
import { Container, Heading } from "../../router";
// import { productlists } from "../../utils/data";
import { ProductCard } from "../cards/ProductCard";

export const ProductList = () => {
  const { products } = useSelector(state => state.product)


  return (
    <>
      <section className="product-home">
        <Container>
          <Heading
            title="Live Auction"
            subtitle="Explore on the world's best & largest Bidding marketplace with our beautiful Bidding products. We want to be a part of your smile, success and future growth."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 my-8">
            {products?.data?.length > 0 && products?.data?.slice(0, 8)?.map((item, index) => (
              <ProductCard item={item} key={index + 1} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
};
