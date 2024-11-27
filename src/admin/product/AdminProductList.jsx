import { Title } from "../../router";
import { Table } from "../../components/Table";
import Pagination from "../../components/common/layout/Pagination";

export const AdminProductList = () => {
  return (
    <>
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="flex justify-between">
          <Title level={5} className=" font-normal">
            Product Lists
          </Title>
        </div>
        <hr className="my-5" />
        <Table />
        <div className="mt-8 flex justify-end">
          <Pagination />
        </div>
      </section>
    </>
  );
};
