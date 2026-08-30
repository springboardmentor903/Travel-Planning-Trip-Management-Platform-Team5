export type Role = 'TRAVELER' | 'GROUP_ADMIN' | 'ADMINISTRATOR';

export type ExpenseCategory =
  | 'TRANSPORTATION'
  | 'HOTEL'
  | 'FOOD'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'MISCELLANEOUS';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  travelType?: string;
  preferredDestinations?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  itineraryId: string;
  time: string;
  title: string;
  location: string;
  notes?: string;
  cost?: number;
  completed: boolean;
  category: 'SIGHTSEEING' | 'DINING' | 'TRANSPORT' | 'RELAXATION' | 'ADVENTURE' | 'HOTEL' | 'OTHER';
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface Budget {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
}

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  payerId?: string;
  payerName?: string;
  description: string;
  receiptLink?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  tripName: string;
  destination: string;
  destinationCoordinates?: { lat: number; lng: number };
  coverImage?: string;
  startDate: string;
  endDate: string;
  description: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED';
  budget: Budget;
  itineraries: ItineraryDay[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummaryDTO {
  category: ExpenseCategory;
  totalAmount: number;
  percentage: number;
  count: number;
}

export interface WeatherInfo {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  imageUrl: string;
  bestTimeToVisit: string;
  averageDailyCost: number;
  currency: string;
  tags: string[];
  popularAttractions: string[];
  weather: {
    temp: number;
    condition: string;
    humidity: number;
  };
  isFavorite?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
