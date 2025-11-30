# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Famlée** is a mental health support web application for university students, built with React 19, TypeScript, and Vite. It features AI-powered chat therapy using Google's Gemini 2.5 Flash model, with multiple therapeutic personas (Healing, Rational, Fun) based on different psychological approaches (ACT, CBT, humor therapy).

## Development Commands

### Setup
```bash
npm install
```

### Environment Configuration
Create `.env.local` file with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Development Server
```bash
npm run dev
```
Runs on `http://localhost:3000` (configured in vite.config.ts)

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Architecture

### Project Structure
```
D:\ai\famlée\
├── src/
│   ├── index.tsx           # Application entry point
│   ├── index.css           # Tailwind directives & global styles
│   ├── App.tsx             # Root component with routing
│   ├── types.ts            # TypeScript type definitions
│   ├── constants.ts        # Mood themes & persona configs
│   ├── components/
│   │   ├── FluidBackground.tsx
│   │   ├── JournalModal.tsx
│   │   └── MascotMenu.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Chat.tsx
│   │   ├── Calendar.tsx
│   │   ├── Campus.tsx
│   │   ├── Waterfall.tsx
│   │   ├── Journal.tsx
│   │   └── Profile.tsx
│   └── services/
│       └── geminiService.ts
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── .env.local              # Environment variables (not in git)
```

### State Management & Routing
- **Manual state-based routing**: No React Router. Page navigation handled via `currentPage` state in `App.tsx`
- **Top-down data flow**: Global state (`globalMood`, `journalEntries`, `currentPersona`) managed in `App.tsx` and passed down via props
- **Persona system**: Three AI personalities with distinct therapeutic approaches, each with custom system instructions and tool sets

### Core Application Flow
1. **App.tsx**: Root component managing global state, navigation, and page rendering
2. **Pages**: Home, Chat, Calendar, Campus, Waterfall, Profile (all in `/pages`)
3. **AI Integration**: Chat sessions created per persona via `geminiService.ts`
4. **Mood System**: Background colors dynamically change based on detected/selected mood (NEUTRAL, HAPPY, ANXIOUS, SAD, ANGRY)

### Key Files & Responsibilities

- **src/App.tsx**: Application shell, navigation, global state, mock journal data generation
- **src/services/geminiService.ts**: Google GenAI SDK integration, chat session creation, audio message handling
- **src/constants.ts**: Mood themes, persona configurations (system instructions, tools, images), base prompts
- **src/types.ts**: TypeScript interfaces for MoodType, ChatMessage, JournalEntry, PersonaConfig, etc.
- **src/pages/Chat.tsx**: Main therapy chat interface with text/voice modes, interactive tools (MBTI, CBT, breathing exercises)
- **src/pages/Home.tsx**: Mood selection, journal entry creation, persona switching
- **src/pages/Calendar.tsx**: Journal entry history visualization
- **src/components/FluidBackground.tsx**: Animated gradient background that responds to mood changes
- **src/components/JournalModal.tsx**: Journal entry creation with mood selection and AI summary generation
- **src/index.css**: Tailwind directives, global styles, glass-panel effect, custom scrollbar styles

### Environment Variables
- **`.env.local`** contains `VITE_GEMINI_API_KEY` with your Gemini API key
- **src/services/geminiService.ts** reads `import.meta.env.VITE_GEMINI_API_KEY` for Google GenAI initialization
- Vite automatically exposes environment variables prefixed with `VITE_` to the client

### Persona System Details
Each persona has:
- **id**: 'healing' | 'rational' | 'fun'
- **systemInstruction**: Custom prompt defining personality and therapeutic approach
- **tools**: Array of interactive features (e.g., "正念呼吸", "CBT 引导", "MBTI 速测")
- **image**: Avatar URL

Default persona: `PERSONAS[1]` (Rational/Logic)

### Chat Features
- **Text Mode**: Standard chat interface with message history and quick-access tools
- **Voice Mode**: Audio recording with visual feedback (cotton candy sphere animation)
- **Interactive Tools**:
  - MBTI Quick Test: 4-question personality assessment
  - CBT Therapy: 4-step cognitive restructuring exercise (Event → Thought → Evidence → Reframe)
  - Mindfulness Breathing: Visual breathing guide with timed phases

### Styling
- **Tailwind CSS**: Utility-first styling
- **Glass morphism**: `.glass-panel` class defined in `index.html` for frosted glass effects
- **Lucide React**: Icon library

## Important Notes

### API Key Security
- Never commit `.env.local` to version control (already in `.gitignore`)
- API key is exposed in client-side bundle via Vite's `define` config - suitable for development/demo, not production

### Audio Recording
- Uses browser `MediaRecorder` API
- Requires microphone permissions
- Audio converted to base64 and sent to Gemini API via `sendAudioMessage()`

### Mock Data
- `generateMockEntries()` in App.tsx creates 7 sample journal entries for calendar visualization
- Real entries added via Home page journal modal

### Deployment Considerations
- Designed for Vercel deployment (per README.md)
- Set `VITE_GEMINI_API_KEY` environment variable in deployment platform
- Static site generation via `npm run build`

## Code Patterns

### Component Structure
- Functional components with hooks (useState, useEffect, useRef)
- Props interfaces defined inline or imported from `types.ts`
- Conditional rendering for modals and page states

### Chat Session Management
- Chat session created per persona change
- Session stored in `useRef` to persist across renders
- Message history maintained in component state

### Mood Detection
- Simple keyword-based analysis in `analyzeMood()` function
- Updates global mood state which triggers background color changes

### Error Handling
- Try-catch blocks in async operations
- Fallback messages for API failures
- Permission error handling for microphone access
