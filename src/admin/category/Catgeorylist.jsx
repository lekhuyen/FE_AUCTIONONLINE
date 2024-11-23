import { AiOutlinePlus } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import { Title, PrimaryButton, ProfileCard } from "../../router";
import { TiEyeOutline } from "react-icons/ti";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { User2 } from "../../components/hero/Hero";
import { useEffect, useState } from "react";
import axios from '../../utils/axios'
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const Catgeorylist = () => {
  const [categories, setCategories] = useState([])
  const getCategories = async () => {
    try {
      const response = await axios.get("category", {
        authRequired: true,
      })
      if (response.code === 0) {
        setCategories(response.result)
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {

    getCategories()
  }, [])

  const handeDeleteCategory = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`category/${id}`, {
            authRequired: true,
          })
          if (response.code === 0) {
            toast.success(response.message)
            getCategories()
          } else {
            toast.error("Error: Unable to delete the category!");
          }
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong!");
        }
      }
    });

  }

  return (
    <>
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="flex justify-between">
          <Title level={5} className=" font-normal">
            Category Lists
          </Title>
          <NavLink to="/category/create">
            <PrimaryButton className="flex items-center gap-3 px-5 py-2 text-sm rounded-md transition-transform hover:scale-105">
              <AiOutlinePlus size={20} />
              <span>Create Category</span>
            </PrimaryButton>
          </NavLink>
        </div>
        <hr className="my-5" />
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">

              <tr>
                <th scope="col" className="px-6 py-5">
                  S.N
                </th>
                <th scope="col" className="px-20 py-5">
                  User
                </th>
                <th scope="col" className="px-6 py-5">
                  Name
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Date
                </th> */}
                <th scope="col" className="px-6 py-3 flex justify-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {categories?.length && categories?.map((category, index) => (
                <tr key={category.category_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index += 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center px-6 text-gray-900 whitespace-nowrap">
                      <div>
                        <ProfileCard>
                          <img src={User2} alt="" />
                        </ProfileCard>
                      </div>
                      <div className="pl-3">
                        <div className="text-base font-semibold capitalize"> Sunil BK</div>
                        <div className="font-normal text-gray-500"> example@gmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{category.category_name}</td>
                  {/* <td className="px-6 py-4">Dec 10 2020</td> */}

                  <td className="px-6 py-4 text-center flex items-center justify-end gap-3 mt-1">
                    <NavLink to="#" type="button" className="font-medium text-indigo-500">
                      <TiEyeOutline size={25} />
                    </NavLink>
                    <NavLink to={`/category/update/${category.category_id}`} className="font-medium text-green">
                      <CiEdit size={25} />
                    </NavLink>
                    <button className="font-medium text-red-500" onClick={() => handeDeleteCategory(category.category_id)}>
                      <MdOutlineDeleteOutline size={25} />
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};
