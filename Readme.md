NSE Data Backend API
A TypeScript Node.js Express backend for reading, processing, and serving NSE market data files stored locally as daily CSVs. Supports broad market data, indices, stocks, and option chains with day-over-day changes (deltas). Provides powerful filtering, querying, and delta analytics to empower premium option chain frontends.

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

Option Chain Delta Features

Usage Examples

Error Handling

CORS Configuration

Development & Extensibility

License

Project Overview
This backend reads daily NSE market data CSV files stored locally in a well-defined folder structure on the user’s Desktop.

It exposes RESTful APIs for:

Nifty 50 stock listing

Multi-day indices and stock data queries

Option chains filtered by symbol, expiry, and date(s)

Computation of day-over-day open interest and premium changes (deltas)

Robust data reading with error handling, normalization, and skipping malformed footer rows.

This design enables premium option chain dashboards to visualize market activity and analyze position buildups or unwinding over user-defined trading days.

Features
Reads daily CSV files named with dates (DDMMYYYY), including option files named opDDMMYYYY.csv.

Supports filtering by multiple dates for indices, stocks, and option chains.

Deltas (day-to-day changes) in option chain data (open interest, premium) computed on backend.

API endpoint to list all available option data dates for UI date pickers.

Graceful handling of corrupted or missing files with warnings.

Supports filtering by symbol and expiry consistently.

Enables cross-origin frontend apps via CORS middleware.

Modular, typed TypeScript codebase with reusable helpers.

Robust API design allows flexible queries with detailed error messages.

Folder Structure
text
project-root/
├── src/
│ ├── routes/
│ │ ├── nifty50.ts # Nifty 50 company routes
│ │ ├── indice.ts # Indices data routes
│ │ ├── stock.ts # Stock data routes
│ │ ├── option.ts # Option chain routes with delta support
│ ├── utils/
│ │ ├── optionReader.ts # CSV reading utilities for options
│ │ ├── stockReader.ts # CSV reading utilities for stocks
│ │ ├── indiceReader.ts # CSV reading utilities for indices
│ │ ├── nifty50Reader.ts # CSV reading for Nifty 50 list
│ │ └── directoryHelper.ts # Directory and file structure validation helpers
│ ├── helpers/
│ │ ├── optionChainBuilder.ts # Base option chain builder
│ │ └── optionChainDeltas.ts # Delta builder utilities
│ ├── types.ts # TypeScript interfaces and types
│ └── server.ts # Express server setup and routing
├── package.json
└── README.md
Setup & Installation
Clone the repository:

bash
git clone <repo-url>
cd <project-root>
Install dependencies:

bash
npm install
Ensure your daily NSE CSV files are placed in the expected folder structure on your Desktop as described below.

Build the TypeScript code (if applicable):

bash
npm run build
Start the backend server:

bash
npm start
The API server listens on http://localhost:3000 by default (can be configured via PORT env variable).

Data Directory Structure
The backend expects NSE market data CSV files organized like this on your Desktop:

text
~/Desktop/NSE-Data/data/
├── broad/
│ └── nifty50list.csv # Static Nifty 50 company list
├── indice/
│ └── ind_close_all_01072025.csv # Indices data by date
├── stock/
│ └── sec_bhavdata_full_01072025.csv # Stock data by date
└── option/
└── op01072025.csv # Option chain data by date (opDDMMYYYY.csv)
Option files must strictly follow the opDDMMYYYY.csv naming, e.g., op02072025.csv.

Expiry dates in option CSV rows are in DD-MM-YYYY format.

API Endpoints
Nifty 50 List
GET /api/nifty50
Returns an array of Nifty 50 company objects.

Indice Data
GET /api/allIndice
Returns indice data from all files.

GET /api/indice/by-dates?dates=01072025[,02072025,...]
Fetch indices for specific dates.

GET /api/indice/by-dates-and-index?dates=01072025&index=NIFTY 50
Filter indice data by dates and index name.

Stock Data
GET /api/stock/by-dates?dates=01072025[,02072025,...]
Stock data filtered by Nifty 50 symbols and EQ series.

GET /api/stock/by-dates-and-symbol?dates=01072025&symbol=TCS
Stock data for a specific symbol on given dates.

Option Chain Data
GET /api/option/chain?symbol=BANKNIFTY&expiry=31-07-2025&dates=02072025&previousDate=01072025
Option chain for symbol & expiry on given date(s) with previous date delta comparison (optional).

GET /api/option/available-dates
Returns all option CSV file dates (DDMMYYYY) available.

GET /api/option/test
Returns unique symbol-expiry combos, symbols, expiries, and sample option rows. Useful for UI initialization.

Option Chain Delta Features
Pass previousDate (single DDMMYYYY) alongside dates to /api/option/chain to get day-over-day deltas in open interest and premium for both CE and PE legs.

Helpful for frontends to detect buildups, unwinding, and significant market activity.

Deltas computed on backend by joining consecutive dates' data on symbol+expiry+strike+option type.

Usage Examples
bash

# Get Nifty 50 companies

curl http://localhost:3000/api/nifty50

# Get indices data for July 1, 2025

curl "http://localhost:3000/api/indice/by-dates?dates=01072025"

# Get stock data for TCS on July 1, 2025

curl "http://localhost:3000/api/stock/by-dates-and-symbol?dates=01072025&symbol=TCS"

# Get option chain for BANKNIFTY on expiry July 31, 2025 (all files)

curl "http://localhost:3000/api/option/chain?symbol=BANKNIFTY&expiry=31/07/2025"

# Get option chain for BANKNIFTY on expiry July 31, 2025 for specific date with delta to previous day

curl "http://localhost:3000/api/option/chain?symbol=BANKNIFTY&expiry=31/07/2025&dates=02072025&previousDate=01072025"

# List all available option file dates

curl http://localhost:3000/api/option/available-dates

# Get available symbol-expiry combos

curl http://localhost:3000/api/option/test
Error Handling
Returns 400 for invalid or missing query parameters.

Returns 404 if no data found for given filters.

Returns 500 if file read, parse, or internal errors occur.

Logs warnings for missing or malformed CSV files but continues processing other files.

Footer/comment lines in CSVs beginning with \* are ignored gracefully.

CORS Configuration
CORS enabled by default to support requests from local frontend dev servers (e.g., on port 5173).

In server.ts:

typescript
import cors from "cors";
app.use(cors());
For production, restrict CORS origins as needed.

Development & Extensibility
Add new NSE data sources easily with new CSV readers.

Extend frontend filtering or analytics with enriched backend responses.

Cache frequently requested data or implement partial loads.

Add authentication for secure use.

Add WebSocket or SSE endpoints later if live feeds become available.

License
MIT License — feel free to use, modify, and distribute.

For questions, issues, or contributions, please open an issue or pull request on the repository.

Happy trading and data analyzing! 🚀

End of README
