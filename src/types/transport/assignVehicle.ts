export interface RouteRef {
  id: string
  name: string
}

export interface VehicleRef {
  id: string
  name: string
  vehicleNumber?: string
}

export interface AssignVehicle {
  id: string
  assignVehiclesId: string
  routeId: string
  route: RouteRef
  routeName: string
  vehicleId: string
  vehicle: VehicleRef
  vehicleName: string
}

export interface AssignVehicleFormData {
  routeId: string
  vehicleId: string
}
