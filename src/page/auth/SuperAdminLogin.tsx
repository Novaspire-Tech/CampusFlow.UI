import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import BackgroundImage from "../../assets/Image/campusflow-login-background.png";
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
    <div className="campusflow-login relative isolate min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-900">
      <img
        src={BackgroundImage}
        alt=""
        aria-hidden="true"
        className="campusflow-login__background absolute inset-0 z-0 h-full w-full object-contain"
      />

      <div className="campusflow-login__form-area relative z-10 w-full md:ml-auto md:w-1/2 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="mb-8 md:hidden">
          <img src={CampusFlowLogo} alt="CampusFlow" className="w-48 h-auto" />
        </div>

        <div className="campusflow-login__card w-full max-w-md bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="mb-7">
            <p className="campusflow-login__eyebrow mb-2 text-xs font-bold uppercase tracking-[0.16em]">
              Welcome back
            </p>
            <h2 className="campusflow-login__title text-2xl sm:text-3xl font-bold">
              Super Admin Login
            </h2>
            <p className="campusflow-login__description mt-2 text-sm">
              Access the super admin dashboard
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <div className="text-center">
                <Link to="/forgot-password">
                  <span className="text-xs text-gray-400 hover:text-white hover:underline transition">
                    Forgot Password?
                  </span>
                </Link>
              </div>

              {methods.formState.errors.root && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">
                    {errors.root?.message || "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={methods.formState.isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg shadow-md font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {methods.formState.isSubmitting ? "Logging in..." : "Login to Super Admin"}
                </button>
              </div>

              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <Link to="/login">
                  <span className="text-sm text-gray-500 hover:text-teal-700 hover:underline transition">
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