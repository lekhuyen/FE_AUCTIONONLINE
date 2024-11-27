import { PrimaryButton } from "../../router";
import { Caption, commonClassNameOfInput, Title } from "../../components/common/Design";
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useLoginExpired } from "../../utils/helper";

export const UpdateCategory = () => {
  const { id } = useParams();
  const [isLogin, setIsLogin] = useState(localStorage.getItem('isIntrospect') || false)
  const { triggerLoginExpired } = useLoginExpired();
  const [categoryUpdate, setCategoryUpdate] = useState({
    category_id: "",
    category_name: "",
  })

  const getCategory = async () => {
    try {
      const response = await axios.get(`category/${id}`,
        { authRequired: true },
      )
      setCategoryUpdate(response)
    } catch (error) {
      console.log(error);

    }
  }
  useEffect(() => {
    if (isLogin) {
      getCategory()
    } else {
      triggerLoginExpired()
    }
  }, [id])


  const handleSubmitCreateCategory = async (e) => {
    e.preventDefault();
    const { name, value } = e.target
    setCategoryUpdate({ ...categoryUpdate, [name]: value })
    try {
      const response = await axios.post("category",
        categoryUpdate,
        { authRequired: true },
      )
      if (response.code === 0) {
        toast.success(response.message)
        setCategoryUpdate({
          category_id: "",
          category_name: "",
        })
      }

    } catch (error) {
      toast.error(error.response.data.message)
    }
  }
  return (
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className=" font-normal mb-5">
          Update Category
        </Title>

        <form onSubmit={handleSubmitCreateCategory}>
          <div className="w-full my-8">
            <Caption className="mb-2">Title *</Caption>
            <input type="text" name="title" hidden value={categoryUpdate.category_id} onChange={e => setCategoryUpdate(e.target.value)} className={`${commonClassNameOfInput}`} />
            <input type="text" name="title" value={categoryUpdate.category_name} onChange={e => setCategoryUpdate(e.target.value)} className={`${commonClassNameOfInput}`} />
          </div>

          <PrimaryButton type="submit" className="rounded-none my-5">
            Update
          </PrimaryButton>
        </form>
      </section>
    </>
  );
};
