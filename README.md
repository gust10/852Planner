# 852Planner 🗺️

<div align="center">

![852Planner Logo](https://img.shields.io/badge/852Planner-Travel_Planning-blue?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**AI-Powered Travel Planning for Hong Kong** 🌟

*Create personalized itineraries, explore landmarks, and discover the best of Hong Kong with intelligent recommendations.*

[Live Demo](https://852planner.com)

</div>

---

## ✨ Features

### 🧠 AI-Powered Planning
- **Smart Itinerary Generation**: AI creates personalized travel plans based on your preferences
- **Intelligent Recommendations**: Get suggestions for attractions, dining, and activities
- **Visualized Routing**: Travel routes shown between destinations

### 🗺️ Interactive Maps & Navigation
- **Google Maps Integration**: Real-time maps with location markers
- **Location-Based Services**: Find nearby attractions and services

### 🌍 Multi-Language Support
- **6 Languages**: English, Chinese, Japanese, Korean, Spanish, French

### 💰 Smart Expense Tracking
- **Cost Estimation**: Automatic expense calculations for activities
- **Category Breakdown**: Visual expense analysis with charts

### 📱 Modern User Experience
- **Responsive Design**: Perfect on mobile, tablet, and desktop


### 🔐 User Management
- **Authentication**: Secure login/signup with Supabase
- **Personal Dashboard**: Save and manage your itineraries
- **Shareable Plans**: Public sharing with direct links

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### UI Components
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white)

### Backend & APIs
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=google-maps&logoColor=white)
![Vertex AI](https://img.shields.io/badge/Vertex_AI-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

### Development Tools
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3735?style=for-the-badge&logo=postcss&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-FBF0DF?style=for-the-badge&logo=bun&logoColor=000000)

</div>

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gust10/HK-WonderPlan.git
   cd 852Planner
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using bun (recommended)
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start Development Server**
   ```bash
   # Using npm
   npm run dev

   # Using bun
   bun run dev
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

---

## 📁 Project Structure

```
852-planner/
├── 📁 public/                 # Static assets
│   ├── favicon.svg
│   ├── logo.png
│   └── robots.txt
├── 📁 src/
│   ├── 📁 components/         # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Map.tsx           # Google Maps integration
│   │   ├── AuthModal.tsx     # Authentication modal
│   │   └── LanguageSelector.tsx
│   ├── 📁 pages/             # Page components
│   │   ├── Index.tsx         # Landing page
│   │   ├── Survey.tsx        # Travel preferences survey
│   │   ├── Itinerary.tsx     # Generated itinerary display
│   │   ├── Dashboard.tsx     # User dashboard
│   │   └── WeatherInfo.tsx   # Weather information
│   ├── 📁 contexts/          # React contexts
│   │   ├── AuthContext.tsx   # User authentication
│   │   └── LanguageContext.tsx
│   ├── 📁 hooks/             # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── useTranslations.ts
│   ├── 📁 integrations/      # External service integrations
│   │   └── supabase/
│   ├── 📁 lib/               # Utility functions
│   │   ├── utils.ts
│   │   └── landmarkImages.ts
│   ├── 📁 translations/      # i18n translations
│   │   └── index.ts
│   └── 📁 types/             # TypeScript definitions
│       └── google-maps.d.ts
├── 📁 supabase/              # Supabase configuration
│   ├── functions/           # Edge functions
│   └── config.toml
├── 📄 package.json
├── 📄 tailwind.config.ts
├── 📄 vite.config.ts
└── 📄 README.md
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Manual Deployment
```bash
npm run build
# Serve dist/ folder with any static server
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Maps Platform** for mapping services
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling
- **Hong Kong Tourism Board** for inspiration

---

<div align="center">

**Made with ❤️ for Hong Kong travelers**

[⭐ Star us on GitHub](https://github.com/gust10/HK-WonderPlan) • [🐛 Report Issues](https://github.com/gust10/HK-WonderPlan/issues) • [💬 Join Discussions](https://github.com/gust10/HK-WonderPlan/discussions)

</div>
