export interface RoutePickupPoint {
  monthlyFees?: (monthlyFees?: any) => string | undefined
  id: string
  routeId: string
  routeName: string
  pickupPointId: string
  pickUpPoint: string
  // period: string;
  vehicleId: string
  vehicleNumber: string
  totalFees: string
  distance: string
  pickupTime: string
  dropOffTime: string
}

export interface RoutePickupPointFormData {
  routeId: string
  pickupPointId: string
  // period:string;
  vehicleId: string
  totalFees: string
  distance: string
  pickupTime: string
  dropOffTime: string
}

export interface RoutePickupPointResponse {
  routePickupPoints: RoutePickupPoint[]
  currentPage: number
  totalItems: number
  totalPages: number
}
