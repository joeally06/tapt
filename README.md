# Tennessee Association of Pupil Transportation

The official website for the Tennessee Association of Pupil Transportation (TAPT), promoting safe transportation for all Tennessee school children through education, training, and advocacy.

## 🚀 Features

- Conference registration system
- Regional luncheon registration
- Hall of Fame nominations
- Board member directory
- Resource library
- Administrative dashboard

## 🛠️ Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Supabase](https://supabase.com) - Backend and authentication
- [LibSQL](https://github.com/libsql/libsql) - Local database for development

## 📦 Dependencies

```json
{
  "dependencies": {
    "astro": "^5.2.5",
    "@astrojs/tailwind": "^5.1.0",
    "@libsql/client": "^0.5.6",
    "@supabase/supabase-js": "^2.39.7",
    "tailwindcss": "^3.4.1"
  }
}
```

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Available Commands

| Command                   | Action                                           |
| :----------------------- | :----------------------------------------------- |
| `npm install`            | Installs dependencies                            |
| `npm run dev`            | Starts local dev server at `localhost:4321`      |
| `npm run build`          | Build your production site to `./dist/`          |
| `npm run preview`        | Preview your build locally, before deploying     |
| `npm run astro ...`      | Run CLI commands like `astro add`, `astro check` |

## 🔐 Environment Variables

The following environment variables are required:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

All rights reserved. © Tennessee Association of Pupil Transportation.