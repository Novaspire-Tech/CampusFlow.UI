import AxiosFunc from '../../utils/axios'
import { AuthPaths, SchoolPaths } from '../../utils/urlpaths'

export interface CommonResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface RoleData {
  name: string
  title: string
  roleId: number
  description: string
  crudPermissions: Array<{ operations: string[]; scope: string }>
}

export interface SendOtpRequest {
  phoneOrEmail: string
}
export interface VerifyOtpRequest {
  phoneOrEmail: string
  otp: string
}
export interface LoginRequest {
  code: string
  phoneOrEmail: string
  password: string
}
export interface AdminLoginRequest {
  phoneOrEmail: string
  password: string
}
export interface RegisterRequest {
  schoolName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
  phoneOtp: string
  emailOtp: string
}
export interface ForgotPasswordSendOtpRequest {
  phoneOrEmail: string
  code?: string | null
}
export interface ForgotPasswordRequest {
  phoneOrEmail: string
  otp: string
  newPassword: string
  confirmNewPassword: string
  code?: string | null
}
export interface LoginResponseData {
  email: string
  school: any
  schoolGroup: any
  logo: string;
  schoolName: string; name: string; staffCode: string; role: RoleData;
  registrationCompleted: boolean; subscribed: boolean;
  accessToken: string; refreshToken: string; code: string;
  schoolCode?: string; schoolGroupCode?: string;
  userType?: string
}
export interface AdminLoginResponseData {
  role: string | RoleData
  code: string | null
  subscribed: boolean | null
  accessToken: string
  refreshToken: string
  schoolCode?: string
  schoolGroupCode?: string
}

export const authApi = {
  sendOtp: async (req: SendOtpRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.sendOtp, req)).data,

  verifyOtp: async (req: VerifyOtpRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.verifyOtp, req)).data,

  register: async (req: RegisterRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.register, req)).data,

  login: async (req: LoginRequest): Promise<CommonResponse<LoginResponseData>> => {
    const res = await AxiosFunc.Post(AuthPaths.login, req)
    const response: CommonResponse<LoginResponseData> = res.data

    if (response.status === 200 && response.data) {
      const d = response.data
      localStorage.setItem('accessToken', d.accessToken ?? '')
      localStorage.setItem('refreshToken', d.refreshToken ?? '')
      localStorage.setItem('role', d.role?.title ?? '')
      localStorage.setItem('registrationCompleted', String(d.registrationCompleted ?? false))
      localStorage.setItem('subscribed', String(d.subscribed ?? false))
      localStorage.setItem('schoolCode', d.schoolCode ?? '')
      localStorage.setItem(
        'schoolGroupCode',
        d.schoolGroupCode ?? d.schoolGroup?.schoolGroupCode ?? '',
      )
      localStorage.setItem('schoolName', d.schoolName ?? '')
      localStorage.setItem('email', d.email ?? '')
      localStorage.setItem('userType', d.userType ?? '')
    
      if (d.staffCode) localStorage.setItem('staffCode', d.staffCode)
    }

    return response
  },

  adminLogin: async (req: AdminLoginRequest): Promise<CommonResponse<AdminLoginResponseData>> => {
    const res = await AxiosFunc.Post(AuthPaths.adminLogin, req)
    const response: CommonResponse<AdminLoginResponseData> = res.data

    if (response.status === 200 && response.data) {
      const d = response.data
      localStorage.setItem('accessToken', d.accessToken ?? '')
      localStorage.setItem('refreshToken', d.refreshToken ?? '')
      localStorage.setItem('subscribed', String(d.subscribed ?? false))


      if (typeof d.role === 'object' && d.role !== null) {
        localStorage.setItem('role', (d.role as RoleData).name ?? '')
        localStorage.setItem('roleDetails', JSON.stringify(d.role))
      } else {
        localStorage.setItem('role', (d.role as string) ?? '')
      }

      if (d.schoolCode) localStorage.setItem('schoolCode', d.schoolCode)
      const schoolGroupCode = d.schoolGroupCode ?? d.code
      if (schoolGroupCode) {
        localStorage.setItem('schoolGroupCode', schoolGroupCode)
        localStorage.setItem('code', schoolGroupCode)
      }
        

    }

    return response
  },

  forgotPasswordSendOtp: async (req: ForgotPasswordSendOtpRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.forgotPasswordSendOtp, req)).data,

  verifyForgotPasswordOtp: async (req: VerifyOtpRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.verifyOtp, req)).data,

  forgotPassword: async (req: ForgotPasswordRequest): Promise<CommonResponse> =>
    (await AxiosFunc.Post(AuthPaths.forgotPassword, req)).data,

  logout: () => {
    localStorage.clear()
    window.location.href = '/login'
  },

  isAuthenticated: () => !!localStorage.getItem('accessToken'),

  getAuthHeaders: () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
  }),
}

export const schoolApi = {
  subscribe: async (data: any): Promise<CommonResponse> =>
    (await AxiosFunc.Post(SchoolPaths.subscribe, data)).data,
}
 