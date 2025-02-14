import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { logout } from "../redux/slide/authSlide";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { intervalToDuration } from "date-fns";

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

export const generateRange = (start, end) => {
  const length = (end + 1) - start;
  return Array.from({ length }, (_, index) => start + index)
}
// [3,4,5,6] => lenght = 4 phan tu


//count down
export const calculateTimeLeft = (end_date, setTimeLeft, setIsDuration = () => { }) => {
  if (!end_date) {
    setTimeLeft(null);
    setIsDuration(true);
    return;
  }

  const now = new Date();
  const endDate = Array.isArray(end_date) ? moment(end_date.join('-'), 'YYYY-MM-DD').toDate() : new Date(end_date);

  if (endDate > now) {
    const duration = intervalToDuration({ start: now, end: endDate });
    setTimeLeft(duration);
    setIsDuration(false);
  } else {
    setTimeLeft(null);
    setIsDuration(true);
  }
};