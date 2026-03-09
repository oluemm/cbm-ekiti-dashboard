# CBM Ekiti Situation Room — Real-time Dashboard

A React-based election data dashboard for the Ekiti State gubernatorial elections (2018 & 2022).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 (TypeScript) |
| Routing | React Router v6 |
| Charting | Recharts |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Data Layer | Static JSON (swappable to real API) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run convert-data` | Convert Excel files → JSON |

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, DashboardShell
│   ├── cards/           # KPICard, ChartCard
│   ├── tables/          # DataTable (sortable)
│   ├── LoadingSpinner   # Loading state
│   └── ErrorAlert       # Error state
├── pages/
│   ├── Overview         # KPI cards, PVC donut, voter bar chart
│   ├── ElectionResults  # APC vs PDP, 2018 vs 2022 swing analysis
│   ├── VotingPattern    # Turnout analysis, radar chart
│   ├── SecurityLogistics# Hilux, choppers, spending
│   ├── PVCAnalysis      # Ward-level PVC collection
│   └── Collation        # Election day results collation
├── services/
│   └── dataService.ts   # Data abstraction (JSON now → API later)
├── hooks/
│   └── useElectionData  # Custom hooks for each data type
├── types/
│   └── index.ts         # All TypeScript interfaces
├── utils/
│   └── formatters.ts    # Number, currency, percentage formatting
├── App.tsx              # Router setup
└── main.tsx             # Entry point
```

## Dashboard Pages

1. **Overview** — KPI cards (LGAs, Wards, PUs, Voters, PVC status), PVC donut chart, voter bar chart by LGA
2. **Election Results** — Year toggle (2018/2022), state-level summary, LGA bar chart, swing analysis table
3. **Voting Pattern** — Turnout comparison, party vote share (stacked bar), APC vs PDP radar
4. **Security & Logistics** — Vehicle deployment, personnel, spending distribution
5. **PVC Analysis** — Collection rates by LGA and ward, with LGA filter
6. **Collation** — Election day status, party totals, per-LGA collation table

## Swapping to Real APIs

All data fetching goes through `src/services/dataService.ts`. To connect to real APIs:

1. Update the fetch URLs in `dataService.ts`
2. Ensure the API response matches the TypeScript interfaces in `src/types/index.ts`
3. Zero changes needed in any component or page

## Converting Excel Data

```bash
npm run convert-data
```

This reads the Excel files from the parent directory and outputs raw JSON files to `public/data/`. Review and map them to the structured format.
