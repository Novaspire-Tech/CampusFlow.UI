import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import BackgroundImage from "../../assets/Image/Loginimage.png";
import TextField from "../../components/controlled/TextField";
import Password from "../../components/controlled/Password";

interface LoginFormValues {
  schoolCode: string;
  phoneOrEmail: string;
  password: string;
  keepLoggedIn: boolean;
}

export default function LoginPage() {
  const methods = useForm<LoginFormValues>({
    defaultValues: {
      schoolCode: "",
      phoneOrEmail: "",
      password: "",
      keepLoggedIn: false,
    },
  });

  const { handleSubmit, control, setError, formState: { errors } } = methods;
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loginRequest = {
        code: data.schoolCode,
        phoneOrEmail: data.phoneOrEmail,
        password: data.password,
      };

      await login(loginRequest);

      if (data.keepLoggedIn) {
        localStorage.setItem("keepLoggedIn", "true");
      }

      const role = localStorage.getItem("role");
      const staffCode = localStorage.getItem("staffCode"); 

      // Navigate based on role
      switch (role) {
        case "SCHOOL":
          navigate("/school-dashboard");
          break;

          case "SCHOOL_GROUP":
          navigate("/school-dashboard");
          break;

           case "SCHOOL_ADMIN":
            navigate(`/staff/view/${staffCode}`);
          break;

          case "GROUP_ADMIN":
          navigate("/group-user-profile");
          break;

        case "TEACHER":
          navigate("/teacher-dashboard");
          break;
        case "PARENT":
          navigate("/parent-dashboard");
          break;
        case "STUDENT":
          navigate("/student-dashboard");
          break;
           case "LIBRARIAN":
          navigate("/library-dashboard");
          break;
        case "HOSTEL":
          navigate("/hostel-dashboard");
          break;
        case "TRANSPORT":
          navigate("/transport-dashboard");
          break;
        case "ACCOUNTANT":
          navigate("/accountant-dashboard");
          break;
        case "RECEPTIONIST":
          navigate("/receptionist-dashboard");
          break;
        default:
          console.log("Unknown role, redirecting to staff profile");
          if (staffCode) {
            navigate(`/staff/view/${staffCode}`);
          } 
          else {
          navigate("/group-user-profile");
          }
          break;
      }
    } catch (error: any) {
      // Parse the error message to determine which field has the error
      const errorMessage = error.message || "Login failed. Please try again.";

      // Check for specific field errors and set them on the appropriate field
      if (errorMessage.toLowerCase().includes("school") || errorMessage.toLowerCase().includes("school code")) {
        setError("schoolCode", {
          type: "manual",
          message: errorMessage,
        });
      } else if (errorMessage.toLowerCase().includes("email") || 
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
        // For general errors, use the root error
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
    <div className="campusflow-login min-h-screen w-full flex flex-col md:flex-row bg-slate-900">

      {/* Left Section */}
      <div className="campusflow-login__visual hidden md:flex md:w-1/2 relative justify-center items-center bg-slate-700 overflow-hidden">
        <img
          src={BackgroundImage}
          alt="Background"
          className="campusflow-login__background absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <img
          src={CampusFlowLogo}
          alt="CampusFlow"
          className="campusflow-login__logo relative z-10 w-64 lg:w-80 drop-shadow-xl"
        />
      </div>

      {/* Right Section */}
      <div className="campusflow-login__form-area w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="mb-8 md:hidden">
          <img
            src={CampusFlowLogo}
            alt="CampusFlow"
            className="w-48 h-auto"
          />
        </div>

        <div className="campusflow-login__card w-full max-w-md bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="mb-7">
            <p className="campusflow-login__eyebrow mb-2 text-xs font-bold uppercase tracking-[0.16em]">
              Welcome back
            </p>
            <h2 className="campusflow-login__title text-2xl sm:text-3xl font-bold">
              Login to Your Account
            </h2>
            <p className="campusflow-login__description mt-2 text-sm">
              Sign in to continue to your school workspace.
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* School Code Field */}
              <div className="mb-4">
                <TextField
                  name="schoolCode"
                  label="School Code"
                  control={control}
                  required={true}
                  placeholder="Enter your school code"
                  className="w-full"
                  labelClassName={labelStyle}
                  inputClassName={`${inputStyle} ${
                    methods.formState.errors.schoolCode ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>

              {/* Email, Phone or Username Field */}
              <div className="mb-4">
                <TextField
                  name="phoneOrEmail"
                  label="Email, Phone Number or Username"
                  control={control}
                  required={true}
                  placeholder="Enter your email, phone or username"
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
              <div className="text-center">
                <Link to="/forgot-password">
                  <span className="text-xs text-gray-400 hover:text-white hover:underline transition">
                    Forgot Password?
                  </span>
                </Link>
              </div>

              {/* Root Error Message (for general errors that don't belong to specific fields) */}
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
                  className="w-full py-2.5 px-4 rounded-lg shadow-md font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {methods.formState.isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}