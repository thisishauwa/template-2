# Feeling Flicks

A mood-based movie recommendation app that suggests films based on how you feel, with preferences for genre, decade, and who you're watching with. Built with Next.js, Framer Motion, and the TMDB API.

## Features

- 🎭 Mood-based movie recommendations
- 🎬 Swipeable movie cards inspired by dating apps
- 📝 Detailed movie information
- 📚 Personal watchlist to save movies for later
- 🔍 Filter options by mood, genre, and decade
- 📱 Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A TMDB API key (get one at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd feeling-flicks
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your TMDB API key
   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

### Running Locally

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **API**: TMDB API
- **Date Formatting**: date-fns
- **Icons**: Lucide React

## Project Structure

- `src/app`: Main app pages and API routes
- `src/components`: React components 
- `src/lib`: Contexts, hooks, and utility functions
- `src/types`: TypeScript type definitions
- `public`: Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.