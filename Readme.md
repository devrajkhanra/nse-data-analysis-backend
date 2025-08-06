NSE Data Backend API
A TypeScript Node.js Express backend for reading, processing, and serving NSE market data files locally stored in CSV format. Supports broad market data, indices, stocks, and option chains with powerful filtering and routing capabilities.

Table of Contents
Project Overview

Features

Folder Structure

Setup & Installation

Data Directory Structure

API Endpoints

Nifty 50 List

Indice Data

Stock Data

Option Chain Data

Usage Examples

Error Handling

CORS Configuration

Development & Extensibility

License

Project Overview
This backend service reads raw NSE market data stored locally as CSV files in a predefined folder structure (typically on the user's desktop), parses the data with robust error handling, and exposes RESTful APIs for client consumption.

It supports:

Nifty 50 stock listing

Indices data

Stock data filtered by Nifty symbols and EQ series

Option chains for multiple symbols, expiries, with strike grouping

Filtering by dates and symbols for flexible querying

Lightweight and modular TypeScript code for maintainability

Features
CSV Data Readers with header normalization, whitespace trimming, and footer comment skipping

Supports reading option CSV files named like opDDMMYYYY.csv

API endpoints supporting filtering by date(s), symbol, expiry

Option chain construction grouping calls (CE) and puts (PE) per strike price

Graceful error handling and warning logging for corrupt or missing files

CORS support for cross-origin frontend consumption

Modular Express route files (nifty50.ts, indice.ts, stock.ts, option.ts)

Typed data models with TypeScript interfaces

Ready integration with modern React frontend or other clients

Folder Structure
text
project-root/
├── src/
│ ├── routes/
│ │ ├── nifty50.ts # Nifty 50 API routes
│ │ ├── indice.ts # Indices API routes
│ │ ├── stock.ts # Stock API routes
│ │ ├── option.ts # Option chain API routes
│ ├── utils/
│ │ ├── optionReader.ts # CSV reader utility for option chain
│ │ ├── stockReader.ts # CSV reader utility for stock data
│ │ ├── indiceReader.ts # CSV reader utility for indice data
│ │ ├── nifty50Reader.ts # CSV reader utility for nifty 50 list
│ │ └── directoryHelper.ts # Helper for directory & file checks
│ ├── helpers/
│ │ └── optionChainBuilder.ts # Function to build option chains grouped by strike
│ ├── types.ts # TypeScript interfaces for data models
│ └── server.ts # Express app initialization and router mounting
├── package.json
└── README.md
Setup & Installation
Clone the repository:

bash
git clone <repo-url>
cd project-root
Install dependencies:

bash
npm install
Place your NSE data files on your Desktop:

The backend expects data files in a specific folder structure under the user's Desktop.

Run the backend server:

bash
npm run build # If using TypeScript build step
npm start # or `node dist/server.js`
The server will listen on http://localhost:3000 by default, configurable by environment variable PORT.

Data Directory Structure
Your data files should be organized as follows under your Desktop:

text
~/Desktop/NSE-Data/data/
├── broad/ # Broad market data (Nifty 50 list etc)
│ └── nifty50list.csv
├── indice/ # Indices data CSV files (date-based)
│ └── ind_close_all_01072025.csv, etc.
├── stock/ # Stock data CSV files (date-based)
│ └── sec_bhavdata_full_01072025.csv, etc.
└── option/ # Option chain CSV files (date based)
└── op01072025.csv, op02072025.csv, ...
Note:
The option files must be named in the pattern:
opDDMMYYYY.csv (e.g., op02072025.csv) where DDMMYYYY is the date.

API Endpoints
Nifty 50 List
GET /api/nifty50
Returns the Nifty 50 companies list.

Indice Data
GET /api/allIndice
Returns all indice data parsed from available indice CSV files.

GET /api/indice/by-dates?dates=01072025
Returns indice data for specific dates (comma-separated supported).

GET /api/indice/by-dates-and-index?dates=01072025&index=NIFTY 50
Returns indice data filtered by dates and index name.

Stock Data
GET /api/stock/by-dates?dates=01072025
Returns stock data filtered by Nifty 50 symbols and EQ series for given dates.

GET /api/stock/by-dates-and-symbol?dates=01072025&symbol=TCS
Returns stock data filtered by dates and a single symbol.

Option Chain Data
GET /api/option/chain?symbol=BANKNIFTY&expiry=31/07/2025
Returns option chain data grouped by strike for the symbol and expiry.

GET /api/option/chain?symbol=BANKNIFTY&expiry=31/07/2025&dates=01072025,02072025
Returns option chain data filtered to specified option CSV file dates (optional).

GET /api/option/test
Returns available unique symbol-expiry combos, distinct symbols, expiries, and sample rows to help clients learn what data is available.

Usage Examples
bash

# Get Nifty 50 companies

curl http://localhost:3000/api/nifty50

# Get indice data for July 1, 2025

curl "http://localhost:3000/api/indice/by-dates?dates=01072025"

# Get stock data for TCS on July 1, 2025

curl "http://localhost:3000/api/stock/by-dates-and-symbol?dates=01072025&symbol=TCS"

# Get option chain for BANKNIFTY on expiry 31-07-2025 for all date files

curl "http://localhost:3000/api/option/chain?symbol=BANKNIFTY&expiry=31-07-2025"

# Get option chain for BANKNIFTY on expiry 31-07-2025 for specific option date files

curl "http://localhost:3000/api/option/chain?symbol=BANKNIFTY&expiry=31-07-2025&dates=01072025,02072025"

# Get available option symbols and expiries for frontend usage

curl http://localhost:3000/api/option/test
Error Handling
The backend gracefully logs warnings if any CSV file is missing or has corrupted/malformed rows.

If no valid data is found, API endpoints return appropriate 4xx or 5xx responses with descriptive error messages.

Input validation on query parameters (dates, symbols, expiry) is strict; date format expected is DDMMYYYY for files and DD-MM-YYYY for expiry strings.

Footer comment lines in CSV files (starting with \*) are ignored automatically.

CORS Configuration
To support frontend client requests (e.g., React app on a different port), CORS is enabled in the Express server.

Backend uses the cors middleware allowing specified origins or all for development.

If needed, you can configure allowed origins in server.ts:

typescript
import cors from "cors";

app.use(cors({
origin: "http://localhost:5173", // React dev server origin
}));
Development & Extensibility
Add new CSV parsers for more NSE datasets or features.

Extend API to support POST requests or batch queries.

Implement caching mechanisms for faster repeated queries.

Enhance authentication/authorization if exposed beyond local use.

Integrate with frontend React/Next.js apps (examples provided).

License
MIT License - Feel free to use, modify, and distribute!

If you have questions or want help extending the project, please open an issue or contact the maintainer.

Happy coding! 🚀
