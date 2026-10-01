import AxiosFunc from "../../utils/axios";

const SchoolServicePaths = {
  completeRegistration: "/school/complete-registration",
  getSingleSchool: (schoolCode: string) => `/school/${schoolCode}/get`,
  updateSchool: (schoolCode: string) => `/school/${schoolCode}/update`,
} as const;

export interface SchoolRegistrationRequest {
  schoolName: string;
  schoolCode: string;
  address: string;
  session: string;
  sessionStartMonth: string;
  startDateOfWeek: string;
}

export interface UpdateSchoolRequest {
  schoolName?: string;
  address?: string;
  session?: string;
  sessionStartMonth?: string;
  startDateOfWeek?: string;
}

export interface SchoolResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export const schoolService = {
  completeRegistration: async (
    data: SchoolRegistrationRequest,
  ): Promise<SchoolResponse> => {
    const response = await AxiosFunc.Post(
      SchoolServicePaths.completeRegistration,
      data,
    );

    if (response.data?.status === 200) {
      localStorage.setItem("registrationCompleted", "true");
    }

    return response.data;
  },

  getSingleSchool: async (schoolCode: string): Promise<SchoolResponse> => {
    const response = await AxiosFunc.Get(
      SchoolServicePaths.getSingleSchool(schoolCode),
    );
    return response.data;
  },

  updateSchool: async (
    schoolCode: string,
    data: UpdateSchoolRequest,
  ): Promise<SchoolResponse> => {
    const response = await AxiosFunc.Put(
      SchoolServicePaths.updateSchool(schoolCode),
      data,
    );
    return response.data;
  },
};
