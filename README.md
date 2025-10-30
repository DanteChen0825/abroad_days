# UK Absence Days Tracker
# 英国离境天数追踪器

A TypeScript + React application to track and calculate absence days from the UK for immigration purposes.

## Features

- ✅ Track departure and return dates for two people (self and spouse)
- ✅ Dual calculation modes:
  - Official: Neither departure nor return day counts as absence
  - Conservative: One of departure/return day counts as absence
- ✅ Calculate rolling 12-month absence days
- ✅ Calculate 5-year total absence days
- ✅ Visual progress bars and risk indicators
- ✅ LocalStorage data persistence
- ✅ Fully responsive design

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Immigration Rules

The app tracks two fixed UK immigration rules:

1. **Rolling 12 Months**: Maximum 180 days absence in any rolling 12-month period
2. **5 Year Total**: Maximum 450 days total absence over 5 years

## Technology Stack

- React 18
- TypeScript 5
- Vite
- date-fns
- LocalStorage for data persistence

## Data Storage

All data is stored locally in your browser's LocalStorage. Remember to export your data regularly for backup purposes.

## License

MIT
