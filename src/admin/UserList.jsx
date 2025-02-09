import { NavLink, useNavigate } from "react-router-dom";
import { Title, ProfileCard } from "../router";
import { TiEyeOutline } from "react-icons/ti";
// import { User2 } from "../components/hero/Hero";
import { useEffect, useState } from "react";
import axios from '../../src/utils/axios'

import { FaCheck } from "react-icons/fa";
import { HiXMark  } from "react-icons/hi2";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useLoginExpired } from "../utils/helper";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Pagination from "../components/common/layout/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../redux/slide/authSlide";

export const UserList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const { users } = useSelector(state => state.auth)
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();

  useEffect(() => {
    dispatch(getAllUsers())
  }, [dispatch])

  //update status
  const handleUpdateStatus = (id) => {
    if (isLogin) {

      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this user status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Update"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.put(`users/status/${id}`, {
              authRequired: true,
            })
            if (response.code === 0) {
              toast.success(response.message)
              await dispatch(getAllUsers(
                {
                  page: users.currentPage,
                  size: users.pageSize
                }
              ))
            } else {
              toast.error("Error: Unable to update the user status!");
            }
          } catch (error) {
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired();
    }
  }

  //delete user
  const handleDeleteUser = (id) => {
    if (isLogin) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this user status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await axios.delete(`users/${id}`, {
              authRequired: true,
            })
            if (response.code === 0) {
              toast.success(response.message)
              await dispatch(getAllUsers(
                {
                  page: users.currentPage,
                  size: users.pageSize
                }
              ))
            } else {
              toast.error("Error: Unable to delete the user status!");
            }
          } catch (error) {
            toast.error("Something went wrong!");
          }
        }
      });
    } else {
      triggerLoginExpired();
    }
  }

  useEffect(() => {
    if (users?.data?.length === 0 && users?.currentPage > 1) {
      navigate(`?page=${users?.currentPage - 1}`);
      dispatch(getAllUsers({
        page: users.currentPage - 1,
        size: users.pageSize
      }));
    }
  }, [users, dispatch, navigate])


  return (
    <section className="shadow-s1 p-8 rounded-lg">
      <div className="flex justify-between">
        <Title level={5} className=" font-normal">
          User Lists
        </Title>
      </div>
      <hr className="my-5" />
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-5">
                S.N
              </th>
              <th scope="col" className="px-6 py-5">
                Username
              </th>
              <th scope="col" className="px-6 py-5">
                Email
              </th>
              <th scope="col" className="px-6 py-5">
                Role
              </th>
              <th scope="col" className="px-6 py-5">
                Address
              </th>
              <th scope="col" className="px-6 py-5">
                CInumber
              </th>
              <th scope="col" className="px-6 py-3">
                DOB
              </th>
              <th scope="col" className="px-6 py-3">
                Active
              </th>
              <th scope="col" className="px-6 py-3 flex justify-end">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {
              users?.data?.length > 0 && users?.data?.map((user, index) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{(users?.currentPage - 1) * users.pageSize + index + 1}</td>
                  <td className="px-6 py-4 capitalize">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize">
                    {user?.roles?.map((role, index) => (
                      <p key={index}>{role.name}</p>
                    ))}
                  </td>
                  <td className="px-6 py-4">{user.address ? user.address : "NOT UPDATED"}</td>
                  <td className="px-6 py-4">{user.ciNumber ? user.ciNumber : "NOT UPDATED"}</td>
                  <td className="px-6 py-4">{user.dob ? user.dob : "NOT UPDATED"}</td>
                  <td className="px-6 py-4">
                    <p onClick={() => handleUpdateStatus(user.id)} className={`${user.active ? "text-green" : "text-red-600"} cursor-pointer`}>
                      {user.active && !user.roles.includes("ROLE_ADMIN") ? <FaCheck size={22} /> : <HiXMark  size={22} />}
                    </p>
                  </td>
                  {/* <td className="px-6 py-4">
                    <ProfileCard>
                      <img src={User2} alt={User2} />
                    </ProfileCard>
                  </td> */}
                  <td className="py-4 flex justify-end px-8">
                    <NavLink to="#" type="button" className="font-medium text-indigo-500">
                      <TiEyeOutline size={25} />
                    </NavLink>
                    <NavLink to={`/product/update/${user.id}`} type="button" className="font-medium text-green">
                      <CiEdit size={25} />
                    </NavLink>
                    <button className="font-medium text-red-500" onClick={() => handleDeleteUser(user.id)}>
                      <MdOutlineDeleteOutline size={25} />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex justify-end">
        <Pagination
          listItem={users}
          to={"/userlist"}
          methodCallApi={getAllUsers}
        />
      </div>
    </section>
  );
};
