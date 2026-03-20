# The Sovereign Ledger - Frontend

A modern React + Vite application for decentralized voting and nominee selection platform.

## Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── TopNavBar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── NomineesPage.jsx
│   │   ├── VotePage.jsx
│   │   └── ResultsPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

### Development

Run the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

## Features

- Home page with hero section
- Nominees listing and cards
- Voting interface with modal confirmations
- Live results/consensus page
- Responsive design
- Dark theme with custom color palette

## Styling

The application uses Tailwind CSS with custom color configuration and custom CSS classes:
- `.glass-panel` - Glassmorphism effect
- `.glass-card` - Glass card styling
- `.hero-gradient-text` - Gradient text effect
- `.gradient-bg` - Radial gradient background

## Environment Variables

See `.env.example` for available environment variables.

## License

All rights reserved © 2026 The Sovereign Ledger
