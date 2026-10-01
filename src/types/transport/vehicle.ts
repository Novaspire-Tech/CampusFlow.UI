export interface Vehicle {
  id: string
  vehicleNumber: string
  vehicleModel: string
  yearMade: string
  registrationNumber: string
  chassisNumber: string
  maxSeatingCapacity: string
  driverLicence: string
  driverContact: string
  driverName: string
  adhaarNumber: string
  document?: string | null
}

export interface VehicleFormData {
  document?: File | null
  vehicleNumber: string
  vehicleModel: string
  yearMade: string
  registrationNumber: string
  chassisNumber: string
  maxSeatingCapacity: string
  driverLicence: string
  driverContact: string
  driverName: string
  adhaarNumber: string
}

export interface VehicleBackendDto {
  vehicleNumber: string | null
  vehicleModel: string | null
  yearMade: string | null
  registrationNumber: string | null
  chasesNumber: string | null
  maxSeatingCapacity: string | null
  driverLicence: string | null
  driverContact: string | null
  driverName: string | null
  adhaarNumber: string | null
}

export interface VehicleResponse {
  status: number
  message: string
  data:
    | Vehicle
    | Vehicle[]
    | {
        source: Vehicle[]
        currentPage: number
        totalItems: number
        totalPages: number
      }
}

export const VehicleValidationRules = {
  vehicleNumber: {
    required: 'Vehicle number is required',
    minLength: {
      value: 2,
      message: 'Vehicle number must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Vehicle number must not exceed 50 characters',
    },
  },
  vehicleModel: {
    maxLength: {
      value: 100,
      message: 'Vehicle model must not exceed 100 characters',
    },
  },
  yearMade: {
    min: {
      value: 1900,
      message: 'Year must be 1900 or later',
    },
    max: {
      value: new Date().getFullYear() + 1,
      message: `Year must not exceed ${new Date().getFullYear() + 1}`,
    },
  },
  registrationNumber: {
    maxLength: {
      value: 50,
      message: 'Registration number must not exceed 50 characters',
    },
  },
  chassisNumber: {
    maxLength: {
      value: 50,
      message: 'Chassis number must not exceed 50 characters',
    },
  },
  maxSeatingCapacity: {
    min: {
      value: 1,
      message: 'Capacity must be at least 1',
    },
    max: {
      value: 100,
      message: 'Capacity must not exceed 100',
    },
  },
  driverName: {
    required: 'Driver name is required',
    minLength: {
      value: 2,
      message: 'Driver name must be at least 2 characters',
    },
    maxLength: {
      value: 100,
      message: 'Driver name must not exceed 100 characters',
    },
  },
  driverLicence: {
    required: 'Driver licence is required',
    minLength: {
      value: 5,
      message: 'Driver licence must be at least 5 characters',
    },
    maxLength: {
      value: 50,
      message: 'Driver licence must not exceed 50 characters',
    },
  },
  driverContact: {
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Contact number must be 10 digits',
    },
  },
  adhaarNumber: {
    required: 'Aadhaar number is required',
    pattern: {
      value: /^\d{12}$/,
      message: 'Aadhaar number must be exactly 12 digits',
    },
  },
  document: {
    validate: {
      fileSize: (value: any) => {
        if (value instanceof File && value.size > 5 * 1024 * 1024) {
          return 'File size must not exceed 5MB'
        }
        return true
      },
      fileType: (value: any) => {
        if (value instanceof File) {
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          if (!allowedTypes.includes(value.type)) {
            return 'Only PDF, JPG, JPEG, and PNG files are allowed'
          }
        }
        return true
      },
    },
  },
}
