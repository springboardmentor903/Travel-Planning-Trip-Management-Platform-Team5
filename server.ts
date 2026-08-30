import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { User, Trip, Expense, Destination, WeatherInfo, CategorySummaryDTO, ExpenseCategory } from './src/types.js';

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'travel_jwt_super_secret_key_2026';

// Initialize Gemini if key exists
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-Memory Database Seed Data
const usersDb: (User & { passwordHash: string })[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    email: 'alex@traveler.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    phone: '+1 (555) 234-5678',
    role: 'TRAVELER',
    travelType: 'Adventure & Culture',
    preferredDestinations: 'Japan, Switzerland, Italy, Bali',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Elena Rostova',
    email: 'elena@traveler.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    phone: '+1 (555) 876-5432',
    role: 'GROUP_ADMIN',
    travelType: 'Luxury & Culinary',
    preferredDestinations: 'France, Greece, Iceland',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const destinationsDb: Destination[] = [
  {
    id: 'dest-1',
    name: 'Kyoto',
    country: 'Japan',
    continent: 'Asia',
    description: 'Ancient temples, sublime bamboo forests, traditional wooden houses, and refined tea ceremony culture.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'March - May, Oct - Nov',
    averageDailyCost: 140,
    currency: 'USD',
    tags: ['Culture', 'Temples', 'Cuisine', 'Photography'],
    popularAttractions: ['Fushimi Inari Taisha', 'Arashiyama Bamboo Grove', 'Kinkaku-ji (Golden Pavilion)', 'Gion District'],
    weather: { temp: 22, condition: 'Sunny', humidity: 55 },
    isFavorite: true,
  },
  {
    id: 'dest-2',
    name: 'Santorini',
    country: 'Greece',
    continent: 'Europe',
    description: 'Breathtaking volcanic caldera views, whitewashed cliffside towns, and world-renowned Aegean sunsets.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'April - November',
    averageDailyCost: 210,
    currency: 'EUR',
    tags: ['Romantic', 'Beaches', 'Sunsets', 'Wine'],
    popularAttractions: ['Oia Village Sunset', 'Fira Cliff Walks', 'Red Beach', 'Akrotiri Ruins'],
    weather: { temp: 26, condition: 'Clear Sky', humidity: 48 },
    isFavorite: true,
  },
  {
    id: 'dest-3',
    name: 'Reykjavik & Golden Circle',
    country: 'Iceland',
    continent: 'Europe',
    description: 'Glacial waterfalls, erupting geysers, thermal lagoons, and ethereal Aurora Borealis displays.',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'Sep - March (Aurora) / June - Aug',
    averageDailyCost: 260,
    currency: 'USD',
    tags: ['Nature', 'Aurora', 'Geothermal', 'Roadtrip'],
    popularAttractions: ['Blue Lagoon', 'Gullfoss Waterfall', 'Thingvellir National Park', 'Diamond Beach'],
    weather: { temp: 11, condition: 'Cloudy & Cool', humidity: 78 },
    isFavorite: false,
  },
  {
    id: 'dest-4',
    name: 'Amalfi Coast',
    country: 'Italy',
    continent: 'Europe',
    description: 'Pastel cliffside villas cascading into the deep blue Tyrrhenian Sea, fragrant lemon groves, and artisan dining.',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'May - September',
    averageDailyCost: 230,
    currency: 'EUR',
    tags: ['Coastline', 'Gastronomy', 'Luxury', 'Scenic'],
    popularAttractions: ['Positano Beach', 'Ravello Villa Rufolo', 'Capri Day Tour', 'Path of the Gods'],
    weather: { temp: 24, condition: 'Partly Cloudy', humidity: 60 },
    isFavorite: false,
  },
  {
    id: 'dest-5',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    continent: 'Europe',
    description: 'Iconic alpine pyramids, scenic cogwheel railways, world-class hiking trails, and cozy fondue chalets.',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'Dec - April (Ski) / June - Sep (Hike)',
    averageDailyCost: 280,
    currency: 'CHF',
    tags: ['Mountains', 'Hiking', 'Skiing', 'Alpine'],
    popularAttractions: ['Gornergrat Railway', 'Matterhorn Glacier Paradise', 'Five Lakes Trail', 'Sunnegga'],
    weather: { temp: 15, condition: 'Brisk & Sunny', humidity: 45 },
    isFavorite: true,
  },
  {
    id: 'dest-6',
    name: 'Ubud & Seminyak',
    country: 'Bali, Indonesia',
    continent: 'Asia',
    description: 'Emerald jungle terraces, spiritual sanctuaries, holistic wellness retreats, and vibrant beach clubs.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    bestTimeToVisit: 'May - September',
    averageDailyCost: 90,
    currency: 'USD',
    tags: ['Wellness', 'Beaches', 'Culture', 'Budget Friendly'],
    popularAttractions: ['Tegallalang Rice Terrace', 'Sacred Monkey Forest', 'Tirta Empul Water Temple', 'Uluwatu Cliff'],
    weather: { temp: 29, condition: 'Warm & Tropical', humidity: 75 },
    isFavorite: false,
  }
];

const tripsDb: Trip[] = [
  {
    id: 'trip-1',
    userId: 'u1',
    tripName: 'Spring Wonders of Japan',
    destination: 'Kyoto & Tokyo, Japan',
    destinationCoordinates: { lat: 35.0116, lng: 135.7681 },
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-04-10',
    endDate: '2026-04-18',
    description: 'An immersive 9-day journey exploring historic Kyoto shrines, Gion geisha districts, bullet trains to Tokyo, and spring culinary tours.',
    status: 'ONGOING',
    budget: {
      id: 'b-1',
      tripId: 'trip-1',
      amount: 3200,
      currency: 'USD'
    },
    itineraries: [
      {
        id: 'it-1',
        tripId: 'trip-1',
        dayNumber: 1,
        date: '2026-04-10',
        title: 'Arrival in Kyoto & Gion Lantern Walk',
        activities: [
          {
            id: 'act-1',
            itineraryId: 'it-1',
            time: '14:00',
            title: 'Check-in at Machiya Boutique Hotel',
            location: 'Higashiyama Ward, Kyoto',
            notes: 'Show reservation code JP-8842 and leave bags.',
            cost: 0,
            completed: true,
            category: 'HOTEL' as const
          },
          {
            id: 'act-2',
            itineraryId: 'it-1',
            time: '17:30',
            title: 'Gion Historic Street Walking Tour',
            location: 'Hanamikoji Dori, Kyoto',
            notes: 'Look for traditional geiko teahouses.',
            cost: 25,
            completed: true,
            category: 'SIGHTSEEING'
          },
          {
            id: 'act-3',
            itineraryId: 'it-1',
            time: '19:30',
            title: 'Welcome Kaiseki Multi-Course Dinner',
            location: 'Gion Karyo, Kyoto',
            notes: 'Seasonal 8-course Kyoto seasonal tasting menu.',
            cost: 110,
            completed: true,
            category: 'DINING'
          }
        ]
      },
      {
        id: 'it-2',
        tripId: 'trip-1',
        dayNumber: 2,
        date: '2026-04-11',
        title: 'Fushimi Inari Shrines & Bamboo Groves',
        activities: [
          {
            id: 'act-4',
            itineraryId: 'it-2',
            time: '06:30',
            title: 'Early Sunrise Trek at 10,000 Torii Gates',
            location: 'Fushimi Inari Taisha',
            notes: 'Hike to the mountain midpoint before crowd arrives.',
            cost: 0,
            completed: true,
            category: 'ADVENTURE'
          },
          {
            id: 'act-5',
            itineraryId: 'it-2',
            time: '12:00',
            title: 'Handmade Soba Lunch & Green Tea Parfait',
            location: 'Nishiki Market, Kyoto',
            notes: 'Try freshly grilled wagyu skewers and matcha sweets.',
            cost: 35,
            completed: true,
            category: 'DINING'
          },
          {
            id: 'act-6',
            itineraryId: 'it-2',
            time: '15:00',
            title: 'Arashiyama Bamboo Forest & Tenryu-ji Zen Garden',
            location: 'Arashiyama, Kyoto',
            notes: 'Rent bicycles near the station.',
            cost: 18,
            completed: false,
            category: 'SIGHTSEEING'
          }
        ]
      },
      {
        id: 'it-3',
        tripId: 'trip-1',
        dayNumber: 3,
        date: '2026-04-12',
        title: 'Golden Pavilion & Tea Ceremony Masterclass',
        activities: [
          {
            id: 'act-7',
            itineraryId: 'it-3',
            time: '09:30',
            title: 'Kinkaku-ji (Golden Pavilion) Visit',
            location: 'Kita Ward, Kyoto',
            notes: 'Stunning reflections in the Kyoko-chi mirror pond.',
            cost: 15,
            completed: false,
            category: 'SIGHTSEEING'
          },
          {
            id: 'act-8',
            itineraryId: 'it-3',
            time: '14:00',
            title: 'Private Urasenke Tea Ceremony',
            location: 'Camellia Tea House Kyoto',
            notes: 'Traditional kimono dressing included.',
            cost: 65,
            completed: false,
            category: 'RELAXATION'
          }
        ]
      }
    ],
    expenses: [
      {
        id: 'exp-1',
        tripId: 'trip-1',
        category: 'HOTEL',
        amount: 850,
        expenseDate: '2026-04-10',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Machiya Boutique Hotel 4-night stay in Kyoto',
        receiptLink: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
        createdAt: '2026-04-10T14:10:00Z'
      },
      {
        id: 'exp-2',
        tripId: 'trip-1',
        category: 'TRANSPORTATION',
        amount: 320,
        expenseDate: '2026-04-10',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'JR Nationwide 7-Day Shinkansen Pass & IC card charge',
        receiptLink: '',
        createdAt: '2026-04-10T10:00:00Z'
      },
      {
        id: 'exp-3',
        tripId: 'trip-1',
        category: 'FOOD',
        amount: 145,
        expenseDate: '2026-04-10',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Gion Karyo Kaiseki dinner & sake tasting',
        receiptLink: '',
        createdAt: '2026-04-10T21:00:00Z'
      },
      {
        id: 'exp-4',
        tripId: 'trip-1',
        category: 'FOOD',
        amount: 58,
        expenseDate: '2026-04-11',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Nishiki Market street food feast & matcha desserts',
        receiptLink: '',
        createdAt: '2026-04-11T13:30:00Z'
      },
      {
        id: 'exp-5',
        tripId: 'trip-1',
        category: 'ENTERTAINMENT',
        amount: 90,
        expenseDate: '2026-04-11',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Gion walking guide & temple admission tickets',
        receiptLink: '',
        createdAt: '2026-04-11T18:00:00Z'
      },
      {
        id: 'exp-6',
        tripId: 'trip-1',
        category: 'SHOPPING',
        amount: 180,
        expenseDate: '2026-04-11',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Handcrafted Kiyomizu ceramic tea set & cedar incense',
        receiptLink: '',
        createdAt: '2026-04-11T17:15:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'trip-2',
    userId: 'u1',
    tripName: 'Aegean Summer Escapade',
    destination: 'Santorini & Mykonos, Greece',
    destinationCoordinates: { lat: 36.3932, lng: 25.4615 },
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-07-02',
    endDate: '2026-07-09',
    description: 'Sun-drenched sailing across the Cyclades islands, private catamaran cruise, and cliffside wine tastings.',
    status: 'PLANNED',
    budget: {
      id: 'b-2',
      tripId: 'trip-2',
      amount: 4500,
      currency: 'EUR'
    },
    itineraries: [
      {
        id: 'it-4',
        tripId: 'trip-2',
        dayNumber: 1,
        date: '2026-07-02',
        title: 'Caldera Check-in & Oia Sunset',
        activities: [
          {
            id: 'act-9',
            itineraryId: 'it-4',
            time: '15:00',
            title: 'Check-in at Cave Suite Villa',
            location: 'Oia, Santorini',
            notes: 'Panoramic infinity pool looking over volcanic crater.',
            cost: 0,
            completed: false,
            category: 'HOTEL'
          },
          {
            id: 'act-10',
            itineraryId: 'it-4',
            time: '19:00',
            title: 'Sunset Dinner at Dimitris Ammoudi Bay',
            location: 'Ammoudi Port',
            notes: 'Fresh grilled octopus right by the water.',
            cost: 140,
            completed: false,
            category: 'DINING'
          }
        ]
      }
    ],
    expenses: [
      {
        id: 'exp-7',
        tripId: 'trip-2',
        category: 'HOTEL',
        amount: 1400,
        expenseDate: '2026-07-02',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'Deposit for Oia cliffside caldera villa',
        receiptLink: '',
        createdAt: '2026-04-01T12:00:00Z'
      },
      {
        id: 'exp-8',
        tripId: 'trip-2',
        category: 'TRANSPORTATION',
        amount: 480,
        expenseDate: '2026-07-02',
        payerId: 'u1',
        payerName: 'Alex Johnson',
        description: 'High-speed ferry tickets Athens to Santorini and return',
        receiptLink: '',
        createdAt: '2026-04-02T10:00:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper: JWT Verification Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' });
  }
}

// Weather Mock Generator / Real Proxy
function generateWeatherData(city: string): WeatherInfo {
  const normalized = city.toLowerCase();
  let temp = 22;
  let condition = 'Partly Cloudy';
  let humidity = 60;
  let windSpeed = 12;

  if (normalized.includes('kyoto') || normalized.includes('tokyo') || normalized.includes('japan')) {
    temp = 21;
    condition = 'Clear & Pleasant';
    humidity = 54;
    windSpeed = 10;
  } else if (normalized.includes('santorini') || normalized.includes('greece') || normalized.includes('athens')) {
    temp = 27;
    condition = 'Sunny & Warm';
    humidity = 45;
    windSpeed = 16;
  } else if (normalized.includes('iceland') || normalized.includes('reykjavik')) {
    temp = 10;
    condition = 'Cool Breeze';
    humidity = 76;
    windSpeed = 22;
  } else if (normalized.includes('bali') || normalized.includes('ubud')) {
    temp = 29;
    condition = 'Tropical Sun';
    humidity = 78;
    windSpeed = 8;
  } else if (normalized.includes('zermatt') || normalized.includes('swiss')) {
    temp = 14;
    condition = 'Crisp Alpine Clear';
    humidity = 42;
    windSpeed = 11;
  } else if (normalized.includes('paris') || normalized.includes('france')) {
    temp = 19;
    condition = 'Mild & Sunny';
    humidity = 62;
    windSpeed = 14;
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const forecast = days.map((day, idx) => ({
    day,
    temp: temp + ((idx % 3) - 1) * 2,
    condition: idx % 2 === 0 ? 'Sunny' : 'Partly Cloudy'
  }));

  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    country: 'International',
    temperature: temp,
    feelsLike: temp + 1,
    condition,
    description: `Optimal travel conditions with ${condition.toLowerCase()}`,
    humidity,
    windSpeed,
    icon: condition.includes('Sunny') || condition.includes('Clear') ? 'sun' : 'cloud-sun',
    forecast
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // AUTH REST ENDPOINTS
  // -------------------------------------------------------------

  // POST /api/auth/register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, travelType, preferredDestinations, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const existingUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ message: 'A user with this email already exists' });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser: User & { passwordHash: string } = {
        id: 'u-' + Date.now(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || '',
        role: (role === 'GROUP_ADMIN' || role === 'ADMINISTRATOR') ? role : 'TRAVELER',
        travelType: travelType || 'Explorer',
        preferredDestinations: preferredDestinations || 'Worldwide',
        profileImage: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      usersDb.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { passwordHash: _, ...safeUser } = newUser;
      return res.status(201).json({ token, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ message: 'Registration failed: ' + err.message });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { passwordHash: _, ...safeUser } = user;
      return res.json({ token, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ message: 'Login failed: ' + err.message });
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticateJwt, (req: AuthRequest, res: Response) => {
    const user = usersDb.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // PUT /api/auth/profile
  app.put('/api/auth/profile', authenticateJwt, (req: AuthRequest, res: Response) => {
    const user = usersDb.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, travelType, preferredDestinations, profileImage } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (travelType) user.travelType = travelType;
    if (preferredDestinations) user.preferredDestinations = preferredDestinations;
    if (profileImage) user.profileImage = profileImage;
    user.updatedAt = new Date().toISOString();

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, message: 'Profile updated successfully' });
  });

  // -------------------------------------------------------------
  // TRIPS CRUD ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/trips (list all trips for authenticated user)
  app.get('/api/trips', authenticateJwt, (req: AuthRequest, res: Response) => {
    const userTrips = tripsDb.filter(t => t.userId === req.user?.id);
    return res.json(userTrips);
  });

  // GET /api/trips/:id
  app.get('/api/trips/:id', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    return res.json(trip);
  });

  // POST /api/trips (Create trip)
  app.post('/api/trips', authenticateJwt, (req: AuthRequest, res: Response) => {
    try {
      const { tripName, destination, startDate, endDate, description, budgetAmount, currency, coverImage } = req.body;

      if (!tripName || !destination || !startDate || !endDate) {
        return res.status(400).json({ message: 'Trip name, destination, start date, and end date are required' });
      }

      const tripId = 'trip-' + Date.now();
      const initialBudget = {
        id: 'b-' + Date.now(),
        tripId,
        amount: Number(budgetAmount) || 2000,
        currency: currency || 'USD'
      };

      // Generate default day-1 itinerary
      const defaultItinerary = {
        id: 'it-' + Date.now(),
        tripId,
        dayNumber: 1,
        date: startDate,
        title: 'Arrival & Destination Exploration',
        activities: [
          {
            id: 'act-' + Date.now(),
            itineraryId: 'it-' + Date.now(),
            time: '14:00',
            title: `Arrival in ${destination}`,
            location: destination,
            notes: 'Check-in to accommodation and rest.',
            cost: 0,
            completed: false,
            category: 'SIGHTSEEING' as const
          }
        ]
      };

      const newTrip: Trip = {
        id: tripId,
        userId: req.user!.id,
        tripName,
        destination,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        startDate,
        endDate,
        description: description || `Adventure exploring the best sights and sounds of ${destination}.`,
        status: 'PLANNED',
        budget: initialBudget,
        itineraries: [defaultItinerary],
        expenses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tripsDb.unshift(newTrip);
      return res.status(201).json(newTrip);
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to create trip: ' + err.message });
    }
  });

  // PUT /api/trips/:id
  app.put('/api/trips/:id', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { tripName, destination, startDate, endDate, description, status, coverImage } = req.body;
    if (tripName) trip.tripName = tripName;
    if (destination) trip.destination = destination;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (description !== undefined) trip.description = description;
    if (status) trip.status = status;
    if (coverImage) trip.coverImage = coverImage;
    trip.updatedAt = new Date().toISOString();

    return res.json(trip);
  });

  // DELETE /api/trips/:id
  app.delete('/api/trips/:id', authenticateJwt, (req: AuthRequest, res: Response) => {
    const index = tripsDb.findIndex(t => t.id === req.params.id && t.userId === req.user?.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    tripsDb.splice(index, 1);
    return res.json({ message: 'Trip deleted successfully' });
  });

  // -------------------------------------------------------------
  // ITINERARY & ACTIVITY ENDPOINTS
  // -------------------------------------------------------------

  // POST /api/trips/:id/itineraries (Add day)
  app.post('/api/trips/:id/itineraries', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { title, date, dayNumber } = req.body;
    const newItinerary = {
      id: 'it-' + Date.now(),
      tripId: trip.id,
      dayNumber: dayNumber || trip.itineraries.length + 1,
      date: date || trip.startDate,
      title: title || `Day ${trip.itineraries.length + 1} Plan`,
      activities: []
    };

    trip.itineraries.push(newItinerary);
    trip.updatedAt = new Date().toISOString();
    return res.status(201).json(newItinerary);
  });

  // POST /api/trips/:id/itineraries/:itineraryId/activities (Add activity)
  app.post('/api/trips/:id/itineraries/:itineraryId/activities', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const itinerary = trip.itineraries.find(it => it.id === req.params.itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary day not found' });
    }

    const { time, title, location, notes, cost, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Activity title is required' });
    }

    const newActivity = {
      id: 'act-' + Date.now(),
      itineraryId: itinerary.id,
      time: time || '10:00',
      title,
      location: location || trip.destination,
      notes: notes || '',
      cost: Number(cost) || 0,
      completed: false,
      category: category || 'SIGHTSEEING'
    };

    itinerary.activities.push(newActivity);
    trip.updatedAt = new Date().toISOString();
    return res.status(201).json(newActivity);
  });

  // PATCH /api/activities/:activityId/toggle
  app.patch('/api/activities/:activityId/toggle', authenticateJwt, (req: AuthRequest, res: Response) => {
    let foundActivity = null;
    let parentTrip = null;

    for (const trip of tripsDb) {
      if (trip.userId === req.user?.id) {
        for (const it of trip.itineraries) {
          const act = it.activities.find(a => a.id === req.params.activityId);
          if (act) {
            act.completed = !act.completed;
            foundActivity = act;
            parentTrip = trip;
            break;
          }
        }
      }
      if (foundActivity) break;
    }

    if (!foundActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    parentTrip!.updatedAt = new Date().toISOString();
    return res.json(foundActivity);
  });

  // DELETE /api/activities/:activityId
  app.delete('/api/activities/:activityId', authenticateJwt, (req: AuthRequest, res: Response) => {
    let deleted = false;

    for (const trip of tripsDb) {
      if (trip.userId === req.user?.id) {
        for (const it of trip.itineraries) {
          const index = it.activities.findIndex(a => a.id === req.params.activityId);
          if (index !== -1) {
            it.activities.splice(index, 1);
            deleted = true;
            trip.updatedAt = new Date().toISOString();
            break;
          }
        }
      }
      if (deleted) break;
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    return res.json({ message: 'Activity deleted' });
  });

  // -------------------------------------------------------------
  // BUDGET & EXPENSES ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/trips/:id/budget
  app.get('/api/trips/:id/budget', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    return res.json(trip.budget);
  });

  // POST /api/trips/:id/budget (Update Budget)
  app.post('/api/trips/:id/budget', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { amount, currency } = req.body;
    if (amount !== undefined) trip.budget.amount = Number(amount);
    if (currency) trip.budget.currency = currency;
    trip.updatedAt = new Date().toISOString();

    return res.json(trip.budget);
  });

  // GET /api/trips/:id/expenses
  app.get('/api/trips/:id/expenses', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    return res.json(trip.expenses);
  });

  // POST /api/trips/:id/expenses (Add Expense)
  app.post('/api/trips/:id/expenses', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const { category, amount, expenseDate, description, receiptLink } = req.body;
    if (!category || amount === undefined || !expenseDate) {
      return res.status(400).json({ message: 'Category, amount, and expense date are required' });
    }

    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      tripId: trip.id,
      category: category as ExpenseCategory,
      amount: Number(amount),
      expenseDate,
      payerId: req.user!.id,
      payerName: req.user!.name,
      description: description || 'General Expense',
      receiptLink: receiptLink || '',
      createdAt: new Date().toISOString()
    };

    trip.expenses.push(newExpense);
    trip.updatedAt = new Date().toISOString();
    return res.status(201).json(newExpense);
  });

  // DELETE /api/expenses/:expenseId
  app.delete('/api/expenses/:expenseId', authenticateJwt, (req: AuthRequest, res: Response) => {
    let deleted = false;

    for (const trip of tripsDb) {
      if (trip.userId === req.user?.id) {
        const index = trip.expenses.findIndex(e => e.id === req.params.expenseId);
        if (index !== -1) {
          trip.expenses.splice(index, 1);
          deleted = true;
          trip.updatedAt = new Date().toISOString();
          break;
        }
      }
      if (deleted) break;
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ message: 'Expense deleted' });
  });

  // GET /api/trips/:id/expenses/summary (Aggregate Summary)
  app.get('/api/trips/:id/expenses/summary', authenticateJwt, (req: AuthRequest, res: Response) => {
    const trip = tripsDb.find(t => t.id === req.params.id && t.userId === req.user?.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals: Record<string, { total: number; count: number }> = {};

    const categories: ExpenseCategory[] = [
      'TRANSPORTATION',
      'HOTEL',
      'FOOD',
      'SHOPPING',
      'ENTERTAINMENT',
      'MISCELLANEOUS'
    ];

    categories.forEach(cat => {
      categoryTotals[cat] = { total: 0, count: 0 };
    });

    trip.expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = { total: 0, count: 0 };
      }
      categoryTotals[exp.category].total += exp.amount;
      categoryTotals[exp.category].count += 1;
    });

    const summary: CategorySummaryDTO[] = categories.map(cat => ({
      category: cat,
      totalAmount: categoryTotals[cat].total,
      count: categoryTotals[cat].count,
      percentage: totalSpent > 0 ? Number(((categoryTotals[cat].total / totalSpent) * 100).toFixed(1)) : 0
    }));

    return res.json({
      tripId: trip.id,
      budgetAmount: trip.budget.amount,
      totalSpent,
      remainingBudget: trip.budget.amount - totalSpent,
      currency: trip.budget.currency,
      categorySummary: summary
    });
  });

  // -------------------------------------------------------------
  // DESTINATIONS & WEATHER & PLACES ENDPOINTS
  // -------------------------------------------------------------

  // GET /api/destinations
  app.get('/api/destinations', (req: Request, res: Response) => {
    const { search, continent } = req.query;
    let results = [...destinationsDb];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (continent && typeof continent === 'string' && continent !== 'All') {
      results = results.filter(d => d.continent.toLowerCase() === continent.toLowerCase());
    }

    return res.json(results);
  });

  // POST /api/destinations/:id/favorite
  app.post('/api/destinations/:id/favorite', authenticateJwt, (req: AuthRequest, res: Response) => {
    const dest = destinationsDb.find(d => d.id === req.params.id);
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    dest.isFavorite = !dest.isFavorite;
    return res.json({ id: dest.id, isFavorite: dest.isFavorite });
  });

  // GET /api/weather?city=X
  app.get('/api/weather', (req: Request, res: Response) => {
    const city = (req.query.city as string) || 'Tokyo';
    const weather = generateWeatherData(city);
    return res.json(weather);
  });

  // -------------------------------------------------------------
  // AI TRIP PLANNER ASSISTANT (Gemini)
  // -------------------------------------------------------------
  app.post('/api/ai/plan-trip', authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { destination, days = 3, interests = 'Culture, Food, Sights', budget = 'Moderate' } = req.body;
      const gemini = getGemini();

      if (gemini) {
        try {
          const prompt = `You are an expert travel concierge and trip planner.
Generate a structured JSON travel itinerary for a ${days}-day trip to ${destination}.
Traveler preferences:
- Interests: ${interests}
- Budget Tier: ${budget}

Respond ONLY with valid JSON in this exact structure, without markdown code fences or other text:
{
  "tripName": "Captivating Journey to ${destination}",
  "destination": "${destination}",
  "description": "2-3 sentences overview of the experience.",
  "recommendedBudget": 1800,
  "currency": "USD",
  "itineraries": [
    {
      "dayNumber": 1,
      "title": "Theme of Day 1",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "location": "Exact landmark/place in ${destination}",
          "notes": "Helpful insider tip",
          "cost": 25,
          "category": "SIGHTSEEING"
        }
      ]
    }
  ]
}
Category MUST be one of: SIGHTSEEING, DINING, TRANSPORT, RELAXATION, ADVENTURE, HOTEL.`;

          const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          let rawText = response.text || '';
          // Clean possible code fence
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);
          return res.json(parsed);
        } catch (aiErr) {
          console.error('Gemini fallback triggered:', aiErr);
        }
      }

      // Fallback Smart Itinerary Generator
      const dayCount = Math.min(Math.max(Number(days) || 3, 1), 7);
      const generatedDays = [];

      for (let i = 1; i <= dayCount; i++) {
        generatedDays.push({
          dayNumber: i,
          title: i === 1 ? `Arrival & Iconic Landmarks of ${destination}` : i === 2 ? `Cultural Immersion & Gourmet Dining` : `Scenic Excursions & Local Hidden Gems`,
          activities: [
            {
              time: '09:30',
              title: `Morning Highlights Tour in ${destination}`,
              location: `${destination} Central Landmark`,
              notes: 'Arrive early to beat ticket lines.',
              cost: 30,
              category: 'SIGHTSEEING'
            },
            {
              time: '13:00',
              title: `Traditional Lunch Experience`,
              location: `${destination} Old Town Market`,
              notes: 'Sample local specialties and fresh delicacies.',
              cost: 40,
              category: 'DINING'
            },
            {
              time: '16:00',
              title: `Afternoon Cultural Walk & Discovery`,
              location: `${destination} Historical Quarter`,
              notes: 'Great photo spot during golden hour.',
              cost: 15,
              category: 'SIGHTSEEING'
            },
            {
              time: '19:30',
              title: `Evening Sunset & Culinary Dinner`,
              location: `Rooftop Bistro in ${destination}`,
              notes: 'Enjoy panoramic vistas and handcrafted cocktails.',
              cost: 65,
              category: 'DINING'
            }
          ]
        });
      }

      return res.json({
        tripName: `Grand Journey to ${destination}`,
        destination,
        description: `A customized ${dayCount}-day itinerary curated for discovering the finest culture, culinary gems, and sights across ${destination}.`,
        recommendedBudget: dayCount * 220,
        currency: 'USD',
        itineraries: generatedDays
      });
    } catch (err: any) {
      return res.status(500).json({ message: 'AI Trip planning failed: ' + err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE / STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
