import express from 'express';
import axios from 'axios';

// Define interfaces for your data
interface InputData {
  name: string;
  gender: string;
  localTime: string;
  lat: number;
  lng: number;
}
interface PlaceName {
  adminName: string;
  countryCode: string;
  fcode: string;
  lat: number;
  lng: number;
  name: string;
  pop: number;
  toponym: string;
}

interface TimePeriod {
  end: number;
  endUtc: string;
  nextGmtOffset: number;
  start: number;
  startUtc: string;
}

interface WeekDay {
  abbr: string;
  iso: number;
  sun: number;
}

interface Time {
  abbreviation: string;
  countryCode: string;
  dst: boolean;
  gmtOffset: number;
  localDt: string;
  period: TimePeriod;
  refJd: number;
  refUnix: number;
  solarUtcOffset: number;
  utc: string;
  weekDay: WeekDay;
  zoneName: string;
}

interface GeotimeResponse1 {
  placenames: PlaceName[];
  time: Time;
  tz: string;
  offset: string;
}
interface GeotimeResponse {
  tz: string;
  offset: number;
}

interface AstroResponse {
  ayanmashaValue: number;
  chartLongitudes: Record<string, number>;
}

interface CombinedData extends InputData, GeotimeResponse, AstroResponse {
  utc: string;
  geo: { lat: number; lng: number };
}

// Initialize Express
const app = express();
const port = 3000;

// Middleware for JSON parsing
app.use(express.json());

// Mock data for testing
const inputData: InputData[] = [
  // Your input data goes here
  {
    "name": "Gloria",
    "gender": "f",
    "localTime": "1989-09-08T00:45:35",
    "lat": 49.815273,
    "lng": 6.129583
  },
  {
    "name": "Pedro",
    "gender": "m",
    "localTime": "1986-06-23T18:37:45",
    "lat": 30.0863373,
    "lng": 78.285542
  },
  {
    "name": "Javier",
    "gender": "m",
    "localTime": "1987-36-17T07:14:15",
    "lat": 36.7418492,
    "lng": -4.4844831
  },
  {
    "name": "Maria",
    "gender": "f",
    "localTime": "2001-02-17T12:02:25",
    "lat": 39.73374182914074,
    "lng": 3.232308804443197
  },
  {
    "name": "Sophia",
    "gender": "f",
    "localTime": "2003-07-08T23:12:55",
    "lat": 64.1334735,
    "lng": 21.9224811
  },
  {
    "name": "Antonio",
    "gender": "m",
    "localTime": "1993-11-30T13:49:05",
    "lat": -25.8962418,
    "lng": 32.5406438
  },
  {
    "name": " Aika",
    "gender": "f",
    "localTime": "1998-02-16T02:21:25",
    "lat": 32.702828,
    "lng": -117.1523
  },
];

// Function to fetch geotime data
async function fetchGeotime(loc: string, dtl: string): Promise<GeotimeResponse1> {
  const url = `https://services.findingyou.co/gtz/geotime?loc=${loc}&dtl=${dtl}`;
  const response = await axios.get(url);
  return response.data;
}

// Function to fetch astro data
async function fetchAstroData(loc: string, dt: string): Promise<AstroResponse> {
  const url = `https://astroapi.findingyou.co/positions?loc=${loc}&dt=${dt}&aya=tc&sid=1&bodies=as,su,mo,ma,me,ju,ve,sa`;
  const response = await axios.get(url);
  return response.data;
}

// Route for get data
app.post('/getData', async (request, res) => {
  try {
    const combinedData: CombinedData[] = [];
    debugger;
    for (const item of inputData) {
      const { name, gender, localTime, lat, lng } = item;
      const loc = `${lat},${lng}`;

      // Fetch geotime data
      const geotimeData = await fetchGeotime(loc, localTime);

    
      const localDateTime = new Date(localTime);
      //const utcDateTime = new Date(geotimeData.time.utc);

      // Fetch astro data
      const astroData = await fetchAstroData(loc, geotimeData.time.utc);

      // Combine all data
      const combinedItem: CombinedData = {
        name,
        gender,
        localTime,
        lat,
        lng,
        utc: geotimeData.time.utc,
        tz: geotimeData.time.zoneName,
        offset: geotimeData.time.gmtOffset,
        geo: { lat, lng },
        ...astroData,
      };

      combinedData.push(combinedItem);
    }

    res.json(combinedData);
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});