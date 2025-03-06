import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeClosed, Upload } from "lucide-react";
import Logo from "/Logo.png";
import { normalRequest } from "../../utils/axiosRequests.config.js";
import * as z from "zod";
import getUser from "../../serverDataHooks/getUser";

const schema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePic: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Profile picture is required")
    .refine((files) => {
      const file = files.item(0);
      return file && (file.type === "image/jpeg" || file.type === "image/jpg");
    }, "Only JPEG images are allowed"),
});

const Signup = () => {
  const navigate = useNavigate();
  const { data: user, onSuccess } = getUser();

  useEffect(() => {
    if (onSuccess) {
      navigate("/");
    }
  }, [onSuccess, navigate]);

  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSignup = async (data) => {
    console.log(data.profilePic[0].name);
    const { email, password, username, profilePic } = data;
    const file = profilePic;
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("profilePic", file);
    try {
      console.log(formData);
      const res = await normalRequest.post(
        "/user/signup",
        {
          email,
          password,
          username,
          file,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleIsVisible = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="h-full w-full bg-black text-white flex justify-center items-center jakartha lg:p-16 gap-5">
      <div className="max-lg:hidden">
        <img src={Logo} alt="logo" className="h-[200px] w-[200px]" />
        <h1 className="text-4xl sm:text-6xl font-extrabold text-left">
          Sign up to Muzox
        </h1>
      </div>
      <div className="h-full max-sm:max-w-[300px] flex flex-col justify-center overflow-y-scroll hiddenScroll gap-7 sm:gap-16">
        <h1 className="text-4xl font-bold lg:hidden text-center">
          Sign up to Muzox
        </h1>
        <form
          onSubmit={handleSubmit(onSignup)}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex flex-col gap-1 lg:grid lg:grid-cols-2 lg:gap-10 w-full">
            <div className="flex flex-col gap-1">
              <div className="text-md flex flex-col">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter Your Username"
                  {...register("username")}
                  aria-invalid={errors.username ? "true" : "false"}
                  className={`${
                    errors.username
                      ? "border-red-400"
                      : "border-gray-500 hover:border-white"
                  } border-[1px] rounded-md p-2 text-md sm:text-lg outline-none bg-black placeholder-gray-400`}
                />
                {errors.username && (
                  <p
                    role="alert"
                    className="text-red-400 text-sm flex items-center gap-1 py-2.5"
                  >
                    <CircleAlert className="inline-block h-[20px]" />
                    {errors.username?.message}
                  </p>
                )}
              </div>
              <div className="text-md flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Please enter your verified email address",
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`${
                    errors.email
                      ? "border-red-400"
                      : "border-gray-500 hover:border-white"
                  } border-[1px] rounded-md p-2 text-md sm:text-lg outline-none bg-black placeholder-gray-400`}
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
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-md flex flex-col">
                <label htmlFor="password">Password</label>
                <div
                  className={`${
                    errors.password
                      ? "border-red-400"
                      : "border-gray-500 hover:border-white"
                  } border-[1px] rounded-md text-md sm:text-lg outline-none flex items-center pr-4 bg-black`}
                >
                  <input
                    type={isVisible ? "text" : "password"}
                    placeholder="Password"
                    id="password"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                    className="p-2 outline-none grow bg-black placeholder-gray-400"
                  />
                  <button
                    type="button"
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
              <div className="text-md flex flex-col">
                <label htmlFor="profilePic" className="text-white">
                  Profile Pic
                </label>

                <label
                  htmlFor="profilePic"
                  className="flex items-center gap-2 px-4 py-2 border-[1px] rounded-md cursor-pointer text-white border-gray-500 hover:border-white"
                >
                  <Upload className="w-5 h-5" />
                  Upload Avatar
                </label>
                <input
                  type="file"
                  id="profilePic"
                  {...register("profilePic")}
                  className="hidden"
                />
                <span
                  className={`text-sm ${
                    errors.profilePic ? "text-red-400" : "text-gray-400"
                  } mt-1`}
                ></span>
                {errors.profilePic && (
                  <p
                    role="alert"
                    className="text-red-400 text-sm flex items-center gap-1 py-2.5"
                  >
                    <CircleAlert className="inline-block h-[20px]" />
                    {errors.profilePic?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="my-3 cursor-pointer p-2 gradientButton font-extrabold rounded-full w-[300px]"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="text-gray-400 text-center">
          Already have an account?{" "}
          <Link
            to={"/login"}
            className="muzoxPurple underline underline-offset-2 text-white"
          >
            Log in to Muzox
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
