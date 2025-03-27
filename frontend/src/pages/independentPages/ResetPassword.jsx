import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const ResetPassword = () => {
  const [currentStep, setCurrentStep] = useState("email");

  return (
    <div className="min-h-screen flex flex-col items-center gap-2 justify-center p-4 bg-black">
      <div className="flex items-center justify-center w-full gap-2.5">
        <img src="/Logo.png" alt="Logo" className="h-[80px] w-[80px] aspect-square" />
        <div className="border border-white h-[45px] w-0"></div>
        <img src="/MUZOX.png" alt="logoName" className="h-[40px]" />
      </div>
      <div className="w-full max-w-md">
        {/* Logo or Title (Optional) */}
        {/* <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </div> */}

        {currentStep === "email" && (
          <EmailInput onNext={() => setCurrentStep("otp")} />
        )}

        {currentStep === "otp" && (
          <>
            <OtpConfirmation />
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentStep("reset")}
                className="text-pink-400 hover:underline font-semibold"
              >
                Skip to Reset Password (Demo)
              </button>
              <button
                onClick={() => setCurrentStep("email")}
                className="ml-2 text-pink-400 hover:underline font-semibold"
              >
                Back to Email
              </button>
            </div>
          </>
        )}

        {currentStep === "reset" && (
          <>
            <ResetPasswordForm />
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentStep("otp")}
                className="text-pink-400 hover:underline font-semibold"
              >
                Back to OTP Verification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function EmailInput({ onNext }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = (data) => {
    console.log("Email submitted:", data.email);
    onNext();
  };

  return (
    <div className="bg-white/10 text-white rounded-xl shadow-lg p-10">
      <h2 className="text-3xl font-bold mb-2 text-center">Reset Password</h2>
      <p className="text-gray-300 mb-6 text-center">
        Enter your email address to receive an OTP.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Please enter your verified email address"
            className="w-full p-3 rounded border border-white/10 bg-transparent text-white placeholder-white/50 
                       focus:outline-none focus:ring-2 focus:ring-[#fe7641]"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="gradientButton w-full p-3 rounded-full font-semibold
                     bg-gradient-to-r from-pink-500 to-purple-600 text-white
                     hover:opacity-90 transition-opacity"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Email"}
        </button>
      </form>
    </div>
  );
}

function OtpConfirmation() {
  const [resendTimer, setResendTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({ defaultValues: { otp: Array(6).fill("") } });

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendOtp = () => {
    setResendTimer(30);
    console.log("Resending OTP...");
  };

  const onSubmit = () => {
    const otpString = otpValues.join("");
    console.log("OTP submitted:", otpString);
    // Simulate OTP verification
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.charAt(0);
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    // Focus next input if current filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    setValue(`otp.${index}`, value);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-white/10 text-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-2 text-center">Verify OTP</h2>
      <p className="text-gray-300 mb-6 text-center">
        Enter the 6-digit code sent to your email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center gap-2">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                placeholder="•"
                className="w-12 h-12 text-center text-2xl rounded border border-[#fe7641] bg-transparent text-white placeholder-white/50
                           focus:outline-none focus:ring-2 focus:ring-[#fe7641]"
                value={otpValues[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                  register(`otp.${index}`, {
                    required: "OTP is required",
                    pattern: {
                      value: /^[0-9]$/,
                      message: "Must be a number",
                    },
                  });
                }}
              />
            ))}
        </div>

        {errors.otp && (
          <p className="text-red-400 text-sm text-center">
            {errors.otp.message}
          </p>
        )}

        <button
          type="submit"
          className="gradientButton w-full p-3 rounded-full font-semibold text-white
                     hover:opacity-90 transition-opacity"
          disabled={isSubmitting || otpValues.some((v) => !v)}
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-4 text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-300">
            Resend OTP in {resendTimer}s
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-gray-400 hover:underline hover:text-[#fe7641] font-medium"
          >
            Didn’t receive the code? Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({ defaultValues: { newPassword: "", confirmPassword: "" } });

  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    console.log("Password reset submitted:", data);
    // Simulate password reset
  };

  return (
    <div className="bg-white/10 text-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-2 text-center">Create New Password</h2>
      <p className="text-gray-300 mb-6 text-center">
        Set a new password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block mb-1 font-medium">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full p-3 rounded border border-[#fe7641] bg-transparent text-white placeholder-white/50 
                         focus:outline-none focus:ring-2 focus:ring-[#fe7641] pr-10"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                  message:
                    "Must include uppercase, lowercase, number & special char",
                },
              })}
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOffIcon className="h-5 w-5 text-[#fe7641]" />
              ) : (
                <EyeIcon className="h-5 w-5 text-[#fe7641]" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-400 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-1 font-medium"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              className="w-full p-3 rounded border border-[#fe7641] bg-transparent text-white placeholder-white/50 
                         focus:outline-none focus:ring-2 focus:ring-[#fe7641]"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 flex items-center"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5 text-[#fe7641]" />
              ) : (
                <EyeIcon className="h-5 w-5 text-[#fe7641]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="gradientButton w-full p-3 rounded-full font-semibold
                     bg-gradient-to-r from-pink-500 to-purple-600 text-white
                     hover:opacity-90 transition-opacity"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
