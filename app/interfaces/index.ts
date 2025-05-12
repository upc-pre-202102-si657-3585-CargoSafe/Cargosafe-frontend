/**
 * Interfaces para la aplicación
 */

/**
 * Tipos de roles disponibles en el sistema
 */
export enum UserRole {
  COMPANY = 'ROLE_COMPANY',
  ENTREPRENEUR = 'ROLE_ENTREPRENEUR',
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN'
}

/**
 * Interfaces para Autenticación
 */

// Solicitud de registro de usuario
export interface SignUpRequest {
  username: string;
  password: string;
  roles: string[];
}

// Respuesta al registro exitoso
export interface SignUpResponse {
  id: number;
  username: string;
  roles: string[];
}

// Solicitud de inicio de sesión
export interface SignInRequest {
  username: string;
  password: string;
}

// Respuesta al inicio de sesión exitoso
export interface SignInResponse {
  id: number;
  username: string;
  token: string;
  roles: string[];
}

/**
 * Interfaces para Usuario y Perfiles
 */

// Usuario
export interface User {
  id: number;
  username: string;
  roles: Role[];
  profile?: Profile;
}

// Rol
export interface Role {
  id: number;
  name: UserRole;
}

// Perfil
export interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  number: string;
  city: string;
  postalCode: string;
  country: string;
  user?: User;
}

// Solicitud de creación de perfil
export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  number: string;
  city: string;
  postalCode: string;
  country: string;
}

// Respuesta de perfil
export interface ProfileResponse {
  id: number;
  fullName: string;
  email: string;
  streetAddress: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    country: string;
  };
  userId: number;
}

/**
 * Interfaces para Viajes y Entregas
 */

// Viaje
export interface Trip {
  id: number;
  name: string;
  type: string;
  weight: number;
  unloadDirection: string;
  unloadLocation: string;
  unloadDate: string;
  expense: Expense;
  alert: Alert;
  ongoingTrip: OnGoingTrip;
  vehicle: Vehicle;
  driver: Driver;
  userId: number;
  destination: string;
  department: string;
  district: string;
  country: string;
  numberPackages: number;
  holderName: string;
  destinationDate: string;
  totalAmount: number;
  destinationAddress: string;
  loadDetail: string;
  pickupAddress: string;
}

// Solicitud de creación de viaje
export interface CreateTripRequest {
  name: string;
  type: string;
  weight: number;
  unloadDirection: string;
  unloadLocation: string;
  unloadDate: string;
  expenseId: number;
  alertId: number;
  ongoingTripId: number;
  vehicleId: number;
  driverId: number;
  userId: number;
  destination: string;
  department: string;
  district: string;
  country: string;
  numberPackages: number;
  holderName: string;
  destinationDate: string;
  totalAmount: number;
  destinationAddress: string;
  loadDetail: string;
  pickupAddress: string;
}

// Gasto
export interface Expense {
  id: number;
  fuelAmount: number;
  fuelDescription: string;
  viaticsAmount: number;
  viaticsDescription: string;
  tollsAmount: number;
  tollsDescription: string;
}

// Solicitud de creación de gasto
export interface CreateExpenseRequest {
  fuelAmount: number;
  fuelDescription: string;
  viaticsAmount: number;
  viaticsDescription: string;
  tollsAmount: number;
  tollsDescription: string;
}

// Alerta
export interface Alert {
  id: number;
  title: string;
  description: string;
  date: Date;
}

// Solicitud de creación de alerta
export interface CreateAlertRequest {
  title: string;
  description: string;
  date: Date;
}

// Viaje en Progreso
export interface OnGoingTrip {
  id: number;
  latitude: number;
  longitude: number;
  speed: number;
  distance: number;
}

// Solicitud de creación de viaje en progreso
export interface CreateOnGoingTripRequest {
  latitude: number;
  longitude: number;
  speed: number;
  distance: number;
}

// Vehículo
export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  maxLoad: number;
  volume: number;
  photoUrl: string;
}

// Solicitud de creación de vehículo
export interface CreateVehicleRequest {
  model: string;
  plate: string;
  maxLoad: number;
  volume: number;
  photoUrl?: string;
}

// Conductor
export interface Driver {
  id: number;
  name: string;
  dni: string;
  license: string;
  contactNum: string;
  photoUrl: string;
}

// Solicitud de creación de conductor
export interface CreateDriverRequest {
  name: string;
  dni: string;
  license: string;
  contactNum: string;
  photoUrl: string;
}

/**
 * Interfaces para Solicitudes de Servicio
 */

// Solicitud de Servicio
export interface RequestService {
  id: number;
  unloadDirection: string;
  type: string;
  numberPackages: number;
  country: string;
  department: string;
  district: string;
  destination: string;
  unloadLocation: string;
  unloadDate: string;
  distance: number;
  holderName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  loadDetail: string;
  weight: string;
  status: Status;
  statuses: RequestServiceStatus[];
}

// Solicitud de creación de servicio
export interface CreateRequestServiceRequest {
  unloadDirection: string;
  type: string;
  numberPackages: number;
  country: string;
  department: string;
  district: string;
  destination: string;
  unloadLocation: string;
  unloadDate: string;
  distance: number;
  statusId: number;
  holderName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  loadDetail: string;
  weight: string;
}

// Estado de la solicitud
export interface Status {
  id: number;
  name: StatusName;
}

// Estado de la solicitud de servicio
export interface RequestServiceStatus {
  id: number;
  requestService: RequestService;
  status: Status;
  timestamp: Date;
}

// Enumeración de nombres de estados
export enum StatusName {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Interfaces para Compañías y Pagos
 */

// Compañía
export interface Company {
  id: number;
  companieName: string;
}

// Solicitud de creación de compañía
export interface CreateCompanyRequest {
  companieName: string;
}

// Tarjeta de Pago
export interface PaymentCard {
  id: number;
  cardNumber: string;
  expiryDate: Date;
  securityCode: number;
}

// Solicitud de creación de tarjeta de pago
export interface CreatePaymentCardRequest {
  cardNumber: string;
  expiryDate: Date;
  securityCode: number;
}

/**
 * Interfaces generales para respuestas de API
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}
