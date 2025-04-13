import { useParams, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleAlert } from "lucide-react";
import { normalRequest } from "../../utils/axiosRequests.config";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../components/loaders/Loading";
import { loadingPlayIcon } from "../../utils/lottie.js";
import { notifyError, notifySuccess } from "../../store/useNotification.js";
import { useEffect, useRef, useState } from "react";
const schema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

const Verify = () => {
  const { userID } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!location.state?.email) {
      navigate("/login");
    }
  }, []);
  const [available, setAvailable] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const email = location.state?.email || "";
  const onVerifyMe = async (data) => {
    try {
      console.log(data);
      const res = await normalRequest.post(`/user/verifyUser/${email}`, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const resendOtp = async () => {
    if (timerRef.current !== null) return;
    try {
      const res = await normalRequest.post(
        `/user/resendVerifyMail/${email}`,
        [],
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setAvailable(false);
      setSeconds(30);
      timerRef.current = setInterval(() => {
        setSeconds((second) => {
          if (second - 1 <= 0) {
            setAvailable(true);
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return second - 1;
        });
      }, 1000);
      notifySuccess("Otp resend successfully");
    } catch (error) {
      notifyError(error?.response?.data || "Failed to regenerate Otp");
      console.log(error);
    }
  };

  const mutation = useMutation({
    mutationFn: onVerifyMe,
    onSuccess: () => {
      notifySuccess("user verified successfully");
      navigate("/login");
    },
    onError: (error) => {
      notifyError(error.response.data.message || "user verification failed");
    },
  });

  if (mutation.isPending) {
    return <Loading src={loadingPlayIcon} />;
  }

  return (
    <div className="h-full bg-black w-full text-white flex justify-center items-center jakartha">
      <div className="h-full  max-sm:max-w-[300px] max-w-[350px] flex justify-center flex-col gap-7 sm:gap-16 overflow-y-scroll hiddenScroll">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-center">
          Verify OTP
        </h1>
        <p className="text-center">
          otp has been sent successfully to your registerd email address <br />
          <span className="text-[#fe7641]">{email}</span>
        </p>
        <form
          onSubmit={handleSubmit((data) => {
            mutation.mutate(data);
          })}
          className="flex flex-col gap-2 justify-center"
        >
          <div className="text-md flex flex-col">
            <label htmlFor="otp">Enter Your OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="6-digit OTP"
              {...register("otp", {
                required: "OTP is required",
              })}
              aria-invalid={errors.otp ? "true" : "false"}
              className={`${
                errors.otp
                  ? "border-red-400"
                  : "border-gray-500 hover:border-white"
              } border-[1px] rounded-md p-2 text-md sm:text-lg outline-none bg-black placeholder-gray-400`}
            />
            {errors.otp && (
              <p
                role="alert"
                className="text-red-400 text-sm flex items-center gap-1 py-2.5"
              >
                <CircleAlert className="inline-block h-[20px]" />
                {errors.otp.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="my-3 cursor-pointer p-2 gradientButton font-extrabold rounded-full"
          >
            Verify
          </button>
        </form>
        {available ? (
          <p className="text-gray-400 text-center">
            Didn't receive OTP?{" "}
            <span
              className="muzoxPurple cursor-pointer underline underline-offset-2 text-white"
              onClick={resendOtp}
            >
              Resend OTP
            </span>
          </p>
        ) : (
          <p className="muzoxPurple text-center underline-offset-2 text-gray-400">
            resend otp <span className="text-[#fe7641]"> {seconds} </span> seconds.
          </p>
        )}
      </div>
    </div>
  );
};

export default Verify;
