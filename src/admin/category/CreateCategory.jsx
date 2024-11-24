import { Caption, PrimaryButton, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { useState } from "react";
import axios from '../../utils/axios'
import { toast } from "react-toastify";

export const CreateCategory = () => {

  const [categoryname, setCategoryname] = useState("")
  const handleSubmitCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const category_name = categoryname
      const response = await axios.post("category",
        category_name,
        { authRequired: true },
      )
      if (response.code === 0) {
        toast.success(response.message)
        setCategoryname("")
      }

    } catch (error) {
      toast.error(error.response.data.message)
      // console.log(error.response.data.message);
    }

  }


  return (
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className=" font-normal mb-5">
          Create Category
        </Title>
        <form onSubmit={handleSubmitCreateCategory}>
          <div className="w-full my-8">
            <Caption className="mb-2">Title *</Caption>
            <input type="text" value={categoryname} onChange={e => setCategoryname(e.target.value)} className={`${commonClassNameOfInput}`} placeholder="Title" required />
          </div>

          <PrimaryButton type="submit" className="rounded-none my-5">
            CREATE
          </PrimaryButton>
        </form>
      </section>
    </>
  );
};
