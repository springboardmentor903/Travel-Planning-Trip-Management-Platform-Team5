import {
  User,
  Trip,
  Budget,
  Expense,
  ItineraryDay,
  Activity,
  Destination,
  WeatherInfo,
  CategorySummaryDTO,
  AuthResponse
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('travel_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

// ---------------------------------------------------------------
// Auth Service
// ---------------------------------------------------------------
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  async updateProfile(profileData: Partial<User>): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },
};

// ---------------------------------------------------------------
// Trip Service
// ---------------------------------------------------------------
export const tripService = {
  async getTrips(): Promise<Trip[]> {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: getHeaders(),
    });
    return handleResponse<Trip[]>(res);
  },

  async getTrip(id: string): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Trip>(res);
  },

  async createTrip(tripData: {
    tripName: string;
    destination: string;
    startDate: string;
    endDate: string;
    description?: string;
    budgetAmount?: number;
    currency?: string;
    coverImage?: string;
  }): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripData),
    });
    return handleResponse<Trip>(res);
  },

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(tripData),
    });
    return handleResponse<Trip>(res);
  },

  async deleteTrip(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// ---------------------------------------------------------------
// Itinerary & Activity Service
// ---------------------------------------------------------------
export const itineraryService = {
  async addDay(tripId: string, dayData: { title?: string; date?: string; dayNumber?: number }): Promise<ItineraryDay> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itineraries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dayData),
    });
    return handleResponse<ItineraryDay>(res);
  },

  async addActivity(
    tripId: string,
    itineraryId: string,
    activity: {
      time: string;
      title: string;
      location: string;
      notes?: string;
      cost?: number;
      category?: string;
    }
  ): Promise<Activity> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itineraries/${itineraryId}/activities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(activity),
    });
    return handleResponse<Activity>(res);
  },

  async toggleActivity(activityId: string): Promise<Activity> {
    const res = await fetch(`${API_BASE}/activities/${activityId}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<Activity>(res);
  },

  async deleteActivity(activityId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/activities/${activityId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// ---------------------------------------------------------------
// Budget & Expense Service
// ---------------------------------------------------------------
export const expenseService = {
  async updateBudget(tripId: string, budgetData: { amount: number; currency: string }): Promise<Budget> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/budget`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    return handleResponse<Budget>(res);
  },

  async getExpenses(tripId: string): Promise<Expense[]> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
      headers: getHeaders(),
    });
    return handleResponse<Expense[]>(res);
  },

  async addExpense(
    tripId: string,
    expense: {
      category: string;
      amount: number;
      expenseDate: string;
      description: string;
      receiptLink?: string;
    }
  ): Promise<Expense> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense),
    });
    return handleResponse<Expense>(res);
  },

  async deleteExpense(expenseId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getExpenseSummary(tripId: string): Promise<{
    tripId: string;
    budgetAmount: number;
    totalSpent: number;
    remainingBudget: number;
    currency: string;
    categorySummary: CategorySummaryDTO[];
  }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses/summary`, {
      headers: getHeaders(),
    });
    return handleResponse<{
      tripId: string;
      budgetAmount: number;
      totalSpent: number;
      remainingBudget: number;
      currency: string;
      categorySummary: CategorySummaryDTO[];
    }>(res);
  },
};

// ---------------------------------------------------------------
// Destination & Weather & AI Service
// ---------------------------------------------------------------
export const destinationService = {
  async getDestinations(search?: string, continent?: string): Promise<Destination[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (continent) params.append('continent', continent);
    const res = await fetch(`${API_BASE}/destinations?${params.toString()}`);
    return handleResponse<Destination[]>(res);
  },

  async toggleFavorite(id: string): Promise<{ id: string; isFavorite: boolean }> {
    const res = await fetch(`${API_BASE}/destinations/${id}/favorite`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ id: string; isFavorite: boolean }>(res);
  },

  async getWeather(city: string): Promise<WeatherInfo> {
    const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
    return handleResponse<WeatherInfo>(res);
  },

  async generateAiTrip(params: {
    destination: string;
    days: number;
    interests?: string;
    budget?: string;
  }): Promise<{
    tripName: string;
    destination: string;
    description: string;
    recommendedBudget: number;
    currency: string;
    itineraries: {
      dayNumber: number;
      title: string;
      activities: {
        time: string;
        title: string;
        location: string;
        notes?: string;
        cost?: number;
        category: 'SIGHTSEEING' | 'DINING' | 'TRANSPORT' | 'RELAXATION' | 'ADVENTURE' | 'HOTEL';
      }[];
    }[];
  }> {
    const res = await fetch(`${API_BASE}/ai/plan-trip`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse<any>(res);
  },
};
