import { useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { OtpField } from "../../components/uncontrolled";
import { Button, Password, UserField } from "../../components/controlled";
import Label from "../../components/controlled/Label";

const LoginPage: React.FC = () => {
  const methods = useForm();
  const { control, handleSubmit, setValue } = methods;
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [changeBtn, setChangeBtn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const userValue = useWatch({ control, name: "UserOrEmail" });

  const sendOtp = () => {
    if (!userValue || !/^\d{10}$/.test(userValue)) {
      setErr("Please enter a valid 10-digit phone number.");
      return;
    }
    setErr("");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    alert(`OTP sent: ${otp}`);
  };

  const verifyOtp = () => {
    const enteredOtp = methods.getValues("otp");
    if (enteredOtp === generatedOtp) {
      setOtpVerified(true);
      alert("OTP verified successfully!");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const onSubmit = (data: any) => {
    if (changeBtn && !otpVerified) {
      alert("Please verify OTP before submitting.");
      return;
    }
    setLoading(true);
    console.log("Login Data:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h2 className="sm:text-2xl text-xl font-bold text-gray-900 mb-6 text-center">
          Sign In
        </h2>

        <FormProvider {...methods}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label
                label="User, Email or Phone"
                required={false}
                labelClassName="text-[12px]"
              />
              <UserField
                name="UserOrEmail"
                label="User, Email or Phone"
                placeholder="User, Email or Phone"
                control={control}
                setChangeBtn={setChangeBtn}
                FieldRequired={true}
              />
              {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
            </div>

            {!changeBtn && (
              <div>
                <Label
                  label="Password"
                  required={false}
                  labelClassName="text-[12px]"
                />
                <Password
                  name="Password"
                  label="Password"
                  placeholder="Password"
                  control={control}
                  validation={false}
                />
              </div>
            )}

            {changeBtn && !otpVerified && (
              <div className="space-y-2">
                {!otpSent && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={!userValue}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Send OTP
                  </button>
                )}

                {otpSent && (
                  <>
                    <OtpField
                      name="otp"
                      length={6}
                      onChangeOTP={(otp) => setValue("otp", otp)}
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Verify OTP
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              {!changeBtn && (
                <a
                  href="#"
                  className="sm:text-sm text-[12px] text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              )}
            </div>

            <Button
              name={changeBtn ? "Login with OTP" : "Sign In"}
              loading={loading}
              clr="#3F51B5"
            />
          </form>
        </FormProvider>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?
          <a
            href="#"
            className="text-indigo-600 hover:text-indigo-500 font-medium ml-1"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
