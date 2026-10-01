import { useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import CampusFlowLogo from '../../assets/campusflow-logo.svg'
import BackgroundImage from '../../assets/Image/campusflow-login-background.png'
import TextField from '../../components/controlled/TextField'
import Password from '../../components/controlled/Password'
import { useTenantRegistry } from '../../hooks/queries/superAdmin/useschoolGroup'

interface LoginFormValues {
  schoolCode: string
  phoneOrEmail: string
  password: string
  keepLoggedIn: boolean
}

export default function LoginPage() {
  const methods = useForm<LoginFormValues>({
    defaultValues: {
      schoolCode: '',
      phoneOrEmail: '',
      password: '',
      keepLoggedIn: false,
    },
  })

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = methods
  const { login } = useAuth()
  const navigate = useNavigate()
  const [schoolSearch, setSchoolSearch] = useState('')
  const [isSchoolListOpen, setIsSchoolListOpen] = useState(false)
  const [highlightedSchoolIndex, setHighlightedSchoolIndex] = useState(0)
  const {
    data: schools,
    isLoading: isSchoolsLoading,
    isError: isSchoolsError,
    refetch: refetchSchools,
  } = useTenantRegistry()
  const filteredSchools = (schools ?? []).filter((school) =>
    `${school.schoolName} ${school.code}`.toLowerCase().includes(schoolSearch.toLowerCase()),
  )

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loginRequest = {
        code: data.schoolCode,
        phoneOrEmail: data.phoneOrEmail,
        password: data.password,
      }

      await login(loginRequest)

      if (data.keepLoggedIn) {
        localStorage.setItem('keepLoggedIn', 'true')
      }

      const role = localStorage.getItem('role')
      const staffCode = localStorage.getItem('staffCode')

      // Navigate based on role
      switch (role) {
        case 'SCHOOL':
          navigate('/school-dashboard')
          break

        case 'SCHOOL_GROUP':
          navigate('/school-dashboard')
          break

        case 'SCHOOL_ADMIN':
          navigate(`/staff/view/${staffCode}`)
          break

        case 'GROUP_ADMIN':
          navigate('/group-user-profile')
          break

        case 'TEACHER':
          navigate('/teacher-dashboard')
          break
        case 'PARENT':
          navigate('/parent-dashboard')
          break
        case 'STUDENT':
          navigate('/student-dashboard')
          break
        case 'LIBRARIAN':
          navigate('/library-dashboard')
          break
        case 'HOSTEL':
          navigate('/hostel-dashboard')
          break
        case 'TRANSPORT':
          navigate('/transport-dashboard')
          break
        case 'ACCOUNTANT':
          navigate('/accountant-dashboard')
          break
        case 'RECEPTIONIST':
          navigate('/receptionist-dashboard')
          break
        default:
          console.log('Unknown role, redirecting to staff profile')
          if (staffCode) {
            navigate(`/staff/view/${staffCode}`)
          } else {
            navigate('/group-user-profile')
          }
          break
      }
    } catch (error: any) {
      // Parse the error message to determine which field has the error
      const errorMessage = error.message || 'Login failed. Please try again.'

      // Check for specific field errors and set them on the appropriate field
      if (
        errorMessage.toLowerCase().includes('school') ||
        errorMessage.toLowerCase().includes('school code')
      ) {
        setError('schoolCode', {
          type: 'manual',
          message: errorMessage,
        })
      } else if (
        errorMessage.toLowerCase().includes('email') ||
        errorMessage.toLowerCase().includes('phone') ||
        errorMessage.toLowerCase().includes('username')
      ) {
        setError('phoneOrEmail', {
          type: 'manual',
          message: errorMessage,
        })
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', {
          type: 'manual',
          message: errorMessage,
        })
      } else {
        // For general errors, use the root error
        setError('root', {
          type: 'manual',
          message: errorMessage,
        })
      }
    }
  }

  const labelStyle = 'block text-gray-200 mb-1 text-sm font-medium'
  const inputStyle =
    'w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'

  return (
    <div className="campusflow-login relative isolate min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-900">
      <img
        src={BackgroundImage}
        alt=""
        aria-hidden="true"
        className="campusflow-login__background absolute inset-0 z-0 h-full w-full object-contain"
      />

      {/* Right Section */}
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
              Login to Your Account
            </h2>
            <p className="campusflow-login__description mt-2 text-sm">
              Sign in to continue to your school workspace.
            </p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* School Selection */}
              <div className="mb-4">
                <Controller
                  name="schoolCode"
                  control={control}
                  rules={{ required: 'School is required' }}
                  render={({ field, fieldState }) => (
                    <div className="relative">
                      <label htmlFor="schoolSearch" className={labelStyle}>
                        School <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="schoolSearch"
                        type="text"
                        role="combobox"
                        autoComplete="off"
                        value={schoolSearch}
                        placeholder={
                          isSchoolsLoading
                            ? 'Loading schools...'
                            : isSchoolsError
                              ? 'Unable to load schools'
                              : 'Search schools by name or code'
                        }
                        disabled={isSchoolsLoading || isSchoolsError || schools.length === 0}
                        aria-autocomplete="list"
                        aria-expanded={isSchoolListOpen && filteredSchools.length > 0}
                        aria-controls="school-options"
                        aria-activedescendant={
                          isSchoolListOpen && filteredSchools.length > 0
                            ? `school-option-${highlightedSchoolIndex}`
                            : undefined
                        }
                        aria-invalid={Boolean(fieldState.error)}
                        onFocus={() => setIsSchoolListOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => setIsSchoolListOpen(false), 100)
                        }}
                        onChange={(event) => {
                          setSchoolSearch(event.target.value)
                          setIsSchoolListOpen(true)
                          setHighlightedSchoolIndex(0)
                          if (field.value) field.onChange('')
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowDown' && filteredSchools.length > 0) {
                            event.preventDefault()
                            setIsSchoolListOpen(true)
                            setHighlightedSchoolIndex((index) =>
                              index >= filteredSchools.length - 1 ? 0 : index + 1,
                            )
                          } else if (event.key === 'ArrowUp' && filteredSchools.length > 0) {
                            event.preventDefault()
                            setIsSchoolListOpen(true)
                            setHighlightedSchoolIndex((index) =>
                              index <= 0 ? filteredSchools.length - 1 : index - 1,
                            )
                          } else if (event.key === 'Enter' && isSchoolListOpen) {
                            event.preventDefault()
                            const school = filteredSchools[highlightedSchoolIndex]
                            if (school) {
                              field.onChange(school.code)
                              setSchoolSearch(`${school.schoolName} (${school.code})`)
                              setIsSchoolListOpen(false)
                            }
                          } else if (event.key === 'Escape') {
                            setIsSchoolListOpen(false)
                          }
                        }}
                        className={`${inputStyle} ${
                          fieldState.error ? 'border-red-500 focus:ring-red-500' : ''
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                      {isSchoolListOpen && filteredSchools.length > 0 && (
                        <ul
                          id="school-options"
                          role="listbox"
                          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl"
                        >
                          {filteredSchools.map((school, index) => (
                            <li
                              key={school.code}
                              id={`school-option-${index}`}
                              role="option"
                              aria-selected={field.value === school.code}
                              onMouseDown={(event) => event.preventDefault()}
                              onMouseEnter={() => setHighlightedSchoolIndex(index)}
                              onClick={() => {
                                field.onChange(school.code)
                                setSchoolSearch(`${school.schoolName} (${school.code})`)
                                setIsSchoolListOpen(false)
                              }}
                              className={`cursor-pointer px-4 py-2 text-sm text-white ${
                                index === highlightedSchoolIndex
                                  ? 'bg-blue-600'
                                  : 'hover:bg-slate-700'
                              }`}
                            >
                              <span className="block font-medium">{school.schoolName}</span>
                              <span className="block text-xs text-slate-300">{school.code}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {isSchoolListOpen && schoolSearch && filteredSchools.length === 0 && (
                        <p className="absolute z-20 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-300 shadow-xl">
                          No matching schools found.
                        </p>
                      )}
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-red-400" role="alert">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                {isSchoolsError && (
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm text-red-400">
                    <span>Could not load the school list. Please try again.</span>
                    <button
                      type="button"
                      onClick={() => void refetchSchools()}
                      className="shrink-0 underline hover:text-red-300"
                    >
                      Retry
                    </button>
                  </div>
                )}
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
                    methods.formState.errors.phoneOrEmail ? 'border-red-500 focus:ring-red-500' : ''
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
                    methods.formState.errors.password ? 'border-red-500 focus:ring-red-500' : ''
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
                    {errors.root?.message || 'Something went wrong. Please try again.'}
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
                  {methods.formState.isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
