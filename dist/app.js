"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
// Initialize Express
const app = (0, express_1.default)();
const port = 3000;
// Middleware for JSON parsing
app.use(express_1.default.json());
// Mock data for testing
const inputData = [
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
function fetchGeotime(loc, dtl) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://services.findingyou.co/gtz/geotime?loc=${loc}&dtl=${dtl}`;
        const response = yield axios_1.default.get(url);
        return response.data;
    });
}
// Function to fetch astro data
function fetchAstroData(loc, dt) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://astroapi.findingyou.co/positions?loc=${loc}&dt=${dt}&aya=tc&sid=1&bodies=as,su,mo,ma,me,ju,ve,sa`;
        const response = yield axios_1.default.get(url);
        return response.data;
    });
}
// Route for processing data
app.post('/process-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const combinedData = [];
        debugger;
        for (const item of inputData) {
            const { name, gender, localTime, lat, lng } = item;
            const loc = `${lat},${lng}`;
            // Fetch geotime data
            const geotimeData = yield fetchGeotime(loc, localTime);
            // Calculate UTC time
            const localDateTime = new Date(localTime);
            //const utcDateTime = new Date(geotimeData.time.utc);
            // Fetch astro data
            const astroData = yield fetchAstroData(loc, geotimeData.time.utc);
            // Combine all data
            const combinedItem = Object.assign({ name,
                gender,
                localTime,
                lat,
                lng, utc: geotimeData.time.utc, tz: geotimeData.time.zoneName, offset: geotimeData.time.gmtOffset, geo: { lat, lng } }, astroData);
            combinedData.push(combinedItem);
        }
        res.json(combinedData);
    }
    catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
