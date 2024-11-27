import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { logout } from "../redux/slide/authSlide";
import { useNavigate } from "react-router-dom";

export const useLoginExpired = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const triggerLoginExpired = () => {
    Swal.fire({
      title: "Login expired, please login again!",
      confirmButtonText: "Login",
      customClass: {
        confirmButton: "swal-confirm-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");
      }
    });
  };

  return { triggerLoginExpired };
}