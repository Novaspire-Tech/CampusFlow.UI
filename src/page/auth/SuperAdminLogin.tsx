import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import BackgroundImage from "../../assets/Image/Loginimage.png";
import TextField from "../../components/controlled/TextField";
import Password from "../../components/controlled/Password";

interface SuperAdminLoginFormValues {
  phoneOrEmail: string;
  password: string;
  keepLoggedIn: boolean;
}

export default function SuperAdminLoginPage() {
  const methods = useForm<SuperAdminLoginFormValues>({
    defaultValues: {
      phoneOrEmail: "",
      password: "",
      keepLoggedIn: false,
    },
  });

  const { handleSubmit, control, setError, formState: { errors } } = methods;
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SuperAdminLoginFormValues) => {
    try {
      const loginRequest = {
        phoneOrEmail: data.phoneOrEmail,
        password: data.password,
      };

      await adminLogin(loginRequest);

      if (data.keepLoggedIn) {
        localStorage.setItem("keepLoggedIn", "true");
      }
      navigate("/admin/dashboard/overview");

    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";

      if (errorMessage.toLowerCase().includes("email") || 
          errorMessage.toLowerCase().includes("phone") || 
          errorMessage.toLowerCase().includes("username")) {
        setError("phoneOrEmail", {
          type: "manual",
          message: errorMessage,
        });
      } else if (errorMessage.toLowerCase().includes("password")) {
        setError("password", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        setError("root", {
          type: "manual",
          message: errorMessage,
        });
      }
    }
  };

  const labelStyle = "block text-gray-200 mb-1 text-sm font-medium";
  const inputStyle =
    "w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900">
      {/* Left Section */}
      <div className="hidden md:flex md:w-1/2 relative justify-center items-center bg-slate-700 overflow-hidden">
        <img
          src={BackgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <img
          src={CampusFlowLogo}
          alt="CampusFlow"
          className="relative z-10 w-64 lg:w-80 drop-shadow-xl"
        />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="mb-8 md:hidden">
          <img
            src={CampusFlowLogo}
            alt="CampusFlow"
            className="w-48 h-auto"
          />
        </div>

        <div className="w-full max-w-md bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Super Admin Login
            </h2>
            <p className="text-gray-400 text-sm">
              Access the super admin dashboard
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email, Phone or Username Field */}
              <div className="mb-4">
                <TextField
                  name="phoneOrEmail"
                  label="Email or Phone Number"
                  control={control}
                  required={true}
                  placeholder="Enter your email or phone number"
                  className="w-full"
                  labelClassName={labelStyle}
                  inputClassName={`${inputStyle} ${
                    methods.formState.errors.phoneOrEmail ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <Password
                  name="password"
                  control={control}
                  label="Password"
                  required={true}
                  placeholder="Enter your password"
                  labelClassName={labelStyle}
                  inputClassName={`${inputStyle} ${
                    methods.formState.errors.password ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link to="/forgot-password">
                  <span className="text-xs text-gray-400 hover:text-white hover:underline transition">
                    Forgot Password?
                  </span>
                </Link>
              </div>

              {/* Root Error Message */}
              {methods.formState.errors.root && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">
                    {errors.root?.message || "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={methods.formState.isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg shadow-md font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {methods.formState.isSubmitting ? "Logging in..." : "Login to Super Admin"}
                </button>
              </div>

              {/* Link to School Login */}
              <div className="text-center mt-4 pt-4 border-t border-slate-700">
                <Link to="/login">
                  <span className="text-sm text-gray-400 hover:text-white hover:underline transition">
                     Back to School Login
                  </span>
                </Link>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}