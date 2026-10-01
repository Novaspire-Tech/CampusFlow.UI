import React, { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "../../assets/Image/Loginimage.png";
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import Password from "../../components/controlled/Password";
import { OtpField } from "../../components/uncontrolled";
import { authApi } from "../../services/apis/api";
import { Button, TextField } from "../../components/controlled";
import ButtonField from "../../components/controlled/ButtonField";

interface ForgotPasswordFormValues {
  schoolCode: string;
  phoneOrEmail: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

const ForgotPasswordPage: React.FC = () => {
  const methods = useForm<ForgotPasswordFormValues>({
    mode: "onChange",
    defaultValues: {
      schoolCode: "",
      phoneOrEmail: "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { handleSubmit, watch, control, setValue, formState, getValues, setError, clearErrors } =
    methods;
  const { isSubmitting, errors } = formState;
  const navigate = useNavigate();

  const schoolCode = watch("schoolCode");
  const phoneOrEmail = watch("phoneOrEmail");

  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [fieldLocked, setFieldLocked] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const isPhone = (value: string) => MOBILE_REGEX.test(value);
  const isEmail = (value: string) => EMAIL_REGEX.test(value);

  useEffect(() => {
    if (otpVerified) {
      setOtpTimer(0);
      return;
    }
    if (otpTimer <= 0) return;
    const timer = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [otpTimer, otpVerified]);

  useEffect(() => {
    if (schoolCode !== undefined) {
      setOtpSent(false);
      setOtpVerified(false);
      setFieldLocked(false);
      clearErrors();
      setOtpError("");
      setValue("phoneOrEmail", "");
      setValue("otp", "");
      setValue("newPassword", "");
      setValue("confirmNewPassword", "");
    }
  }, [schoolCode]);

  const canSendOtp = () => {
    if (!phoneOrEmail) return false;
    if (/^\d+$/.test(phoneOrEmail)) {
      return isPhone(phoneOrEmail);
    }
    return isEmail(phoneOrEmail);
  };

  const handleSendOtp = async () => {
    if (!canSendOtp()) return;

    setLoadingOtp(true);
    clearErrors();
    setOtpError("");

    try {
      const payload = {
        phoneOrEmail: phoneOrEmail,
        code: schoolCode.trim() || null,
      };

      const response = await authApi.forgotPasswordSendOtp(payload);
      if (response.status === 200) {
        setOtpSent(true);
        setFieldLocked(true);
        setOtpTimer(120);
        setOtpVerified(false);
        setValue("otp", "");
        clearErrors();
      } else {
        if (response.message?.toLowerCase().includes("school") ||
            response.message?.toLowerCase().includes("code")) {
          setError("schoolCode", {
            type: "manual",
            message: response.message || "Invalid school code",
          });
        } else if (
          response.message?.toLowerCase().includes("email") ||
          response.message?.toLowerCase().includes("phone") ||
          response.message?.toLowerCase().includes("user") ||
          response.message?.toLowerCase().includes("not found")
        ) {
          setError("phoneOrEmail", {
            type: "manual",
            message: response.message || "Invalid email or phone number",
          });
        } else {
          setError("phoneOrEmail", {
            type: "manual",
            message: response.message || "Failed to send OTP",
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP";

      if (errorMessage?.toLowerCase().includes("school") ||
          errorMessage?.toLowerCase().includes("code")) {
        setError("schoolCode", {
          type: "manual",
          message: errorMessage,
        });
      } else if (
        errorMessage?.toLowerCase().includes("email") ||
        errorMessage?.toLowerCase().includes("phone") ||
        errorMessage?.toLowerCase().includes("user") ||
        errorMessage?.toLowerCase().includes("not found")
      ) {
        setError("phoneOrEmail", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        setError("phoneOrEmail", {
          type: "manual",
          message: errorMessage,
        });
      }
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleOtpChange = async (value: string) => {
    setValue("otp", value, { shouldValidate: true });
    setOtpVerified(false);
    setOtpError("");

    if (value.length !== 6) return;

    try {
      const response = await authApi.verifyForgotPasswordOtp({
        phoneOrEmail: phoneOrEmail,
        otp: value,
      });
      if (response.status === 200) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpVerified(false);
        setOtpError(response.message || "Invalid OTP");
      }
    } catch {
      setOtpVerified(false);
      setOtpError("Invalid OTP");
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    await handleSendOtp();
  };

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    if (!otpVerified) return;

    clearErrors();
    try {
      const payload = {
        phoneOrEmail: data.phoneOrEmail,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
        code: data.schoolCode.trim() || null,
      };

      const response = await authApi.forgotPassword(payload);

      if (response.status === 200) {
        alert("Password changed successfully!");
        methods.reset();
        setOtpVerified(false);
        setOtpSent(false);
        setFieldLocked(false);
        navigate("/");
      } else {
        setError("root", {
          type: "manual",
          message: response.message || "Failed to reset password",
        });
      }
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Failed to reset password",
      });
    }
  };

  const labelStyle = "block text-gray-200 mb-1 text-sm font-medium";
  const inputStyle =
    "w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900">
      {/* Left Image */}
      <div className="hidden md:flex md:w-1/2 relative justify-center items-center bg-slate-700 overflow-hidden">
        <img
          src={BackgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <img
          src={CampusFlowLogo}
          alt="CampusFlow"
          className="relative z-10 w-64 lg:w-80"
        />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Forgot Password
          </h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* School Code Field */}
              <div className="space-y-2">
                <label className={labelStyle}>
                  School Code{" "}
                  <span className="text-gray-400 text-xs">
                    (Leave empty for admin users)
                  </span>
                </label>

                <TextField
                  name="schoolCode"
                  label=""
                  control={control}
                  placeholder="Enter school code"
                  labelClassName="hidden"
                  inputClassName={inputStyle}
                  disabled={otpSent || otpVerified}
                />

                {errors.schoolCode && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.schoolCode.message}
                  </p>
                )}

                {!errors.schoolCode && (
                  <p className="text-gray-400 text-xs">
                    {schoolCode.trim() ? "School user mode" : "Admin user mode"}
                  </p>
                )}
              </div>

              {!otpVerified && (
                <>
                  {/* Phone/Email */}
                  <div>
                    <TextField
                      name="phoneOrEmail"
                      label="Email or Phone Number"
                      control={control}
                      required
                      placeholder="Enter registered email or phone number"
                      labelClassName={labelStyle}
                      inputClassName={inputStyle}
                      disabled={fieldLocked}
                    />

                    {errors.phoneOrEmail && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.phoneOrEmail.message}
                      </p>
                    )}
                  </div>

                  {/* OTP Section */}
                  {otpSent && (
                    <div className="space-y-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <label className="text-xs text-gray-400">Enter OTP</label>
                      <OtpField
                        name="otp"
                        length={6}
                        onChangeOTP={handleOtpChange}
                      />
                      {otpTimer > 0 && !otpVerified && (
                        <p className="text-gray-400 text-xs">
                          Resend available in {formatTime(otpTimer)}
                        </p>
                      )}
                      {otpError && (
                        <p className="text-red-400 text-xs">{otpError}</p>
                      )}
                    </div>
                  )}

                  {/* Send OTP Button */}
                  <ButtonField
                    name={otpSent ? "Resend OTP" : "Send OTP"}
                    loading={loadingOtp}
                    onClick={otpSent ? handleResendOtp : handleSendOtp}
                    isDisable={!canSendOtp() || loadingOtp || otpTimer > 0}
                    clr="#3b82f6"
                    type="button"
                  />
                </>
              )}

              {otpVerified && (
                <>
                  <Password
                    name="newPassword"
                    label="New Password"
                    control={control}
                    required
                    placeholder="Create new password"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    onChange={() => clearErrors("root")}
                    rules={{
                      validate: () => {
                        if (!PASSWORD_REGEX.test(getValues("newPassword"))) {
                          return "Password must be 8–20 characters with at least one uppercase letter, one number, and one special character";
                        }
                      },
                    }}
                  />

                  <Password
                    name="confirmNewPassword"
                    label="Confirm New Password"
                    control={control}
                    required
                    placeholder="Confirm your password"
                    labelClassName={labelStyle}
                    inputClassName={inputStyle}
                    validation
                    rules={{
                      validate: (value: string) => {
                        if (value !== getValues("newPassword"))
                          return "Passwords do not match";
                        return true;
                      },
                    }}
                  />

                  {errors.root && (
                    <p className="text-red-400 text-xs">{errors.root.message}</p>
                  )}

                  <Button
                    name="Change Password"
                    loading={isSubmitting}
                    clr="#22c55e"
                    showAlways={true}
                  />
                </>
              )}

              <Button
                name="Back to Login"
                onClick={goBack}
                clr="#3b82f6"
                loading={false}
                showAlways={true}
              />
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;