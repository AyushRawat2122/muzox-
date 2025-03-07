import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleAlert, Eye, EyeClosed } from "lucide-react";
import Logo from "/Logo.png";
import { Link, Navigate, useNavigate } from "react-router";
import {
  normalRequest,
  queryClient,
} from "../../utils/axiosRequests.config.js";
import getUser from "../../serverDataHooks/getUser.js";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../components/Loading.jsx";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(
      6,
      {
        message: "Password must be at least 6 characters long",
      },
      {
        required: true,
      }
    )
    .max(20),
});

const Login = () => {
  const { data: user, isSuccess } = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Use Effect triggered", isSuccess);
    if (isSuccess) {
      navigate("/");
    } // if user is logged in then send it back to home
  }, [isSuccess]);

  const [isVisible, setIsVisible] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onLogin = async (data) => {
    const email = data?.email;
    const password = data?.password;
    try {
      const res = await normalRequest.post(
        "/user/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res;
      }
     catch (error) {
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: onLogin,
    onSuccess: () => { queryClient.invalidateQueries([{ queryKey: "user" }]);},
    onError: (error) => {
      console.log(error)
    },
  });

  if(mutation.isPending){
    return <Loading/>
  }

  const toggleIsVisible = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="h-full w-full bg-black text-white flex justify-center items-center jakartha">
      <div className="h-full max-sm:max-w-[300px] max-w-[350px] flex flex-col gap-7 sm:gap-7 hiddenScroll items-center overflow-y-scroll">
        <img
          src={Logo}
          alt="logo"
          className="aspect-square h-[100px] w-[100px]"
        />
        <h1 className="text-4xl sm:text-6xl font-extrabold text-center">
          Log in to Muzox
        </h1>

        <form
          onSubmit={handleSubmit((data)=>{mutation.mutate(data)})}
          className="flex flex-col gap-2 justify-center w-full"
        >
          <div className="text-md flex flex-col">
            <label htmlFor="Email">Email</label>
            <input
              type="text"
              placeholder="Email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              id="Email"
              className={`${
                errors.email
                  ? "border-red-400 "
                  : "border-gray-500  hover:border-white"
              } border-[1px] rounded-md p-2 text-md sm:text-lg outline-none`}
            />
            {errors.email && (
              <p
                role="alert"
                className="text-red-400 text-sm flex items-center gap-1 py-2.5"
              >
                <CircleAlert className="inline-block h-[20px]" />
                {errors.email?.message}
              </p>
            )}
          </div>
          <div className="text-md flex flex-col">
            <label htmlFor="Password">Password</label>
            <div
              className={`${
                errors.password
                  ? "border-red-400"
                  : "border-gray-500 hover:border-white"
              } border-[1px] rounded-md text-md sm:text-lg outline-none flex items-center pr-4`}
            >
              <input
                type={isVisible ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                className="p-2 outline-none grow"
              />
              <button
                onClick={toggleIsVisible}
                className="active:border-white border-b-2"
              >
                {isVisible ? <Eye /> : <EyeClosed />}
              </button>
            </div>
            {errors.password && (
              <p
                role="alert"
                className="text-red-400 text-sm flex items-center gap-1 py-2.5"
              >
                <CircleAlert className="inline-block h-[20px]" />
                {errors.password?.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="my-3 cursor-pointer p-2 gradientButton font-extrabold rounded-full"
          >
            Log In
          </button>
        </form>

        <div className="flex flex-col gap-4 sm:gap-10 sm:mt-5 ">
          <a
            href="/"
            className="muzoxPurple text-center underline underline-offset-2"
          >
            Forgot your password?
          </a>
          <p className="text-gray-400 text-center">
            Don't have an account?{" "}
            <Link
              to={"/signup"}
              className="muzoxPurple underline underline-offset-2 text-white"
            >
              Sign up for Muzox.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
