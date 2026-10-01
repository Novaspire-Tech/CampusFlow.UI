import React, { useEffect, useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import Password from "../../components/controlled/Password";
import SchoolNameField from "../../components/controlled/SchoolNameField";
import { OtpField } from "../../components/uncontrolled";
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import BackgroundImage from "../../assets/Image/Loginimage.png";
import { useAuth } from "../../contexts/AuthContext";
import Email from "../../components/controlled/Email";
import Phone from "../../components/controlled/Phone";
import { useNavigate } from "react-router-dom";
import ButtonField from "../../components/controlled/ButtonField";

interface RegistrationFormValues {
  schoolName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  emailOtp: string;
  phoneOtp: string;
}

const RegistrationPage: React.FC = () => {
  const { sendOtp, register: registerUser, loading } = useAuth();

  const methods = useForm<RegistrationFormValues>({
    mode: "onChange",
    defaultValues: {
      schoolName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      emailOtp: "",
      phoneOtp: "",
    },
  });

  const {
    handleSubmit,
    watch,
    control,
    setValue,
    formState,
    trigger,
    clearErrors,
    reset,
  } = methods;

  const email = watch("email");
  const phone = watch("phone");
  const password = watch("password");
  const { isValid, errors } = formState;
  const navigate = useNavigate();

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Timer handlers
  useEffect(() => {
    if (emailTimer <= 0) return;
    const timer = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [emailTimer]);

  useEffect(() => {
    if (phoneTimer <= 0) return;
    const timer = setInterval(() => setPhoneTimer((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [phoneTimer]);

  // Send OTP handlers
  const handleSendEmailOtp = async () => {
    const isValidEmail = await trigger("email");
    if (!isValidEmail || !email) return;

    setEmailLoading(true);
    try {
      const response = await sendOtp(email);
      if (response.status === 200) {
        setEmailOtpSent(true);
        setEmailTimer(30);
        setValue("emailOtp", "");
        clearErrors("emailOtp");
      } else {
        alert(response.message || "Failed to send OTP");
      }
    } catch (err: any) {
      alert(err.message || "Failed to send Email OTP. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    const isValidPhone = await trigger("phone");
    if (!isValidPhone || !phone) return;

    setPhoneLoading(true);
    try {
      const response = await sendOtp(phone);
      if (response.status === 200) {
        setPhoneOtpSent(true);
        setPhoneTimer(30);
        setValue("phoneOtp", "");
        clearErrors("phoneOtp");
      } else {
        alert(response.message || "Failed to send OTP");
      }
    } catch (err: any) {
      alert(err.message || "Failed to send Phone OTP. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailTimer > 0) return;
    await handleSendEmailOtp();
  };

  const handleResendPhoneOtp = async () => {
    if (phoneTimer > 0) return;
    await handleSendPhoneOtp();
  };

  // Submit form
  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    setSubmitError("");
    setSuccessMessage("");

    if (!emailOtpSent || !phoneOtpSent) {
      alert("Please send OTPs to both email and phone before registration.");
      return;
    }

    const emailOtp = data.emailOtp.trim();
    const phoneOtp = data.phoneOtp.trim();

    if (!emailOtp || !phoneOtp) {
      alert("Please enter both Email and Phone OTPs.");
      return;
    }

    if (emailOtp.length !== 6 || phoneOtp.length !== 6) {
      alert("Please enter valid 6-digit OTPs.");
      return;
    }

    try {
      await registerUser({
        schoolName: data.schoolName,
        phoneNumber: data.phone,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phoneOtp: data.phoneOtp,
        emailOtp: data.emailOtp,
      });

      setSuccessMessage("Registration successful!");
      reset();
      setEmailOtpSent(false);
      setPhoneOtpSent(false);
      setEmailTimer(0);
      setPhoneTimer(0);
    } catch (err: any) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    }
  };

  const canSubmit = isValid && emailOtpSent && phoneOtpSent && !loading;

  const labelStyle = "block text-gray-200 mb-1 text-sm font-medium";
  const inputStyle =
    "w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900">
      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 relative justify-center items-center bg-slate-700">
        <img
          src={BackgroundImage}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Background"
        />
        <img
          src={CampusFlowLogo}
          className="relative z-10 w-48 lg:w-80"
          alt="CampusFlow"
        />
      </div>

      {/* Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-10 md:px-10 lg:px-16">
        <div className="mb-8 md:hidden">
          <img
            src={CampusFlowLogo}
            className="w-48"
            alt="CampusFlow"
          />
        </div>

        <div className="w-full max-w-md sm:max-w-lg bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
            Create an Account
          </h1>

          {submitError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* School Name */}
              <SchoolNameField
                name="schoolName"
                label="School Name"
                required
                placeholder="Enter School Name"
                control={control}
                labelClassName={labelStyle}
                inputClassName={inputStyle}
              />

              {/* Email */}
              <div className="space-y-2">
                <Email
                  name="email"
                  label="Email Id"
                  placeholder="Enter email"
                  control={control}
                  required
                  readOnly={emailOtpSent}
                  showEditIcon={emailOtpSent}
                  labelClassName={labelStyle}
                  inputClassName={inputStyle}
                  editIconName="FaEdit"
                  onEditClick={() => {
                    setEmailOtpSent(false);
                    setEmailTimer(0);
                    setValue("emailOtp", "");
                    clearErrors("emailOtp");
                  }}
                />

                {/* OTP Input */}
                {emailOtpSent && (
                  <div className="space-y-2">
                    <label className="block text-gray-300 text-sm font-medium">
                      Enter Email OTP
                    </label>
                    <div className="bg-slate-700 p-3 rounded-md border border-slate-600">
                      <OtpField
                        name="emailOtp"
                        length={6}
                        onChangeOTP={(v) => {
                          setValue("emailOtp", v, { shouldValidate: true });
                          if (v.length === 6) trigger("emailOtp");
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Timer */}
                {emailOtpSent && emailTimer > 0 && (
                  <div className="flex items-center px-3 py-2 bg-slate-700 rounded-lg">
                    <span className="text-gray-400 text-sm">
                      Resend available in {emailTimer}s
                    </span>
                  </div>
                )}

                {/*  Button */}
                <div className="w-full">
                  <ButtonField
                    name={
                      emailOtpSent && emailTimer === 0
                        ? "Resend OTP"
                        : "Send OTP"
                    }
                    loading={emailLoading}
                    onClick={
                      emailOtpSent && emailTimer === 0
                        ? handleResendEmailOtp
                        : handleSendEmailOtp
                    }
                    isDisable={emailTimer > 0 || !email || !!errors.email}
                    clr="#3b82f6"
                    type="button"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Phone
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  required
                  readOnly={phoneOtpSent}
                  showEditIcon={phoneOtpSent}
                  labelClassName={labelStyle}
                  inputClassName={inputStyle}
                  editIconName="FaEdit"
                  onEditClick={() => {
                    setPhoneOtpSent(false);
                    setPhoneTimer(0);
                    setValue("phoneOtp", "");
                    clearErrors("phoneOtp");
                  }}
                />

                {/* OTP Input */}
                {phoneOtpSent && (
                  <div className="space-y-2">
                    <label className="block text-gray-300 text-sm font-medium">
                      Enter Phone OTP
                    </label>
                    <div className="bg-slate-700 p-3 rounded-md border border-slate-600">
                      <OtpField
                        name="phoneOtp"
                        length={6}
                        onChangeOTP={(v) => {
                          setValue("phoneOtp", v, { shouldValidate: true });
                          if (v.length === 6) trigger("phoneOtp");
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Timer */}
                {phoneOtpSent && phoneTimer > 0 && (
                  <div className="flex items-center px-3 py-2 bg-slate-700 rounded-lg">
                    <span className="text-gray-400 text-sm">
                      Resend available in {phoneTimer}s
                    </span>
                  </div>
                )}

                {/* Button */}
                <div className="w-full">
                  <ButtonField
                    name={
                      phoneOtpSent && phoneTimer === 0
                        ? "Resend OTP"
                        : "Send OTP"
                    }
                    loading={phoneLoading}
                    onClick={
                      phoneOtpSent && phoneTimer === 0
                        ? handleResendPhoneOtp
                        : handleSendPhoneOtp
                    }
                    isDisable={phoneTimer > 0 || !phone || !!errors.phone}
                    clr="#3b82f6"
                    type="button"
                  />
                </div>
              </div>

              {/* Password */}
              <Password
                name="password"
                label="Password"
                required
                control={control}
                placeholder="Enter password"
                labelClassName={labelStyle}
                inputClassName={inputStyle}
                validation
              />
              {/* Confirm Password */}
              <Password
                name="confirmPassword"
                label="Confirm Password"
                required
                control={control}
                placeholder="Re-enter password"
                labelClassName={labelStyle}
                inputClassName={inputStyle}
                validation
                rules={{
                  validate: (value: string) =>
                    value === password || "Passwords do not match",
                }}
              />

              {/* Register + Back Buttons (Side by Side) */}
              <div className="pt-4 w-full flex justify-between items-center gap-3">
                <ButtonField
                  name="Register"
                  loading={loading}
                  isDisable={!canSubmit}
                  clr="#22c55e"
                  type="submit"
                />

                <ButtonField
                  name="Back"
                  loading={false}
                  type="button"
                  onClick={() => navigate("/")}
                  clr="#3b82f6"
                />
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
