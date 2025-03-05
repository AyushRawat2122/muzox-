import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CircleAlert, Eye, EyeClosed, Upload } from "lucide-react";
import Logo from "/Logo.png";
import { Link } from "react-router";

const schema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePic: z
    .instanceof(Image, { message: "File must be an Image" })
    .refine(
      (file) => file.size < 5 * 1024 * 1024,
      "Files must be less than 5 Mb"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "only jpg,png and webp"
    ),
});

const Signup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSignup = (data) => {
    console.log("Form submitted:", data);
  };

  const toggleIsVisible = () => {
    setIsVisible((prev) => !prev);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files.length > 0) {
      const file = files[0];

      // ✅ Check File Type (JPEG only)
      if (
        !(
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "webp"
        )
      ) {
        setError("profilePic", {
          type: "manual",
          message: "Only JPEG / Jpg , webp and png images are allowed!",
        });
        setFileName("Invalid file type!");
        return;
      }

      // ✅ Check File Size (Max 2MB)
      if (file.size >= 5 * 1024 * 1024) {
        setError("profilePic", {
          type: "manual",
          message: "File size must be less than 5MB!",
        });
        setFileName("File too large!");
        return;
      }

      // ✅ Clear Errors & Update File Name
      clearErrors("profilePic");
      setFileName(file.name);
    }
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

                {/* Custom Upload Button */}
                <label
                  htmlFor="profilePic"
                  className="flex items-center gap-2 px-4 py-2 border-[1px] 
    rounded-md cursor-pointer
    text-white border-gray-500 hover:border-white"
                >
                  <Upload className="w-5 h-5" />
                  Upload Avatar
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="profilePic"
                  {...register("profilePic")}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg" // Only JPG Allowed
                />

                {/* Show Selected File Name */}
                <span
                  className={`text-sm ${
                    errors.profilePic ? "text-red-400" : "text-gray-400"
                  } mt-1`}
                >
                  {fileName}
                </span>

                {/* Show Validation Error */}
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
