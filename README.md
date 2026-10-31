# Emunah AI

A Bible-based productivity and spiritual guidance app that provides AI-powered responses grounded in the Holy Bible.

## Features

- 🤖 ChatGPT-style interface for spiritual questions
- 📖 Responses strictly grounded in the Holy Bible
- 🔐 User authentication with MongoDB
- 💬 Chat history with local storage
- 🔄 "New Chat" functionality
- 📱 Clean, scripture-inspired UI
- ⏳ Loading states with spiritual messaging

## Tech Stack

- React Native (Expo)
- TypeScript
- Tailwind CSS (twrnc)
- MongoDB for user authentication
- Gemini AI API
- AsyncStorage for local data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- MongoDB instance
- Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scripture-ai.git
cd scripture-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your configuration:
```
EXPO_PUBLIC_MONGODB_URI=your_mongodb_uri
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Authentication

The app uses MongoDB for user authentication with the following features:

- Email/password registration and login
- Secure password hashing with bcrypt
- Persistent sessions with AsyncStorage
- Protected routes
- Automatic redirection to auth screens

### User Model

```typescript
interface User {
  _id: string;
  email: string;
  password: string; // Hashed
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Project Structure

```
scripture-ai/
├── app/                 # App screens and navigation
│   ├── sign-in.tsx     # Sign in screen
│   ├── sign-up.tsx     # Sign up screen
│   └── index.tsx       # Main chat screen
├── components/         # Reusable UI components
├── contexts/          # React contexts
│   └── AuthContext.tsx # Authentication context
├── models/            # Data models
├── services/          # API and external services
├── utils/             # Utility functions
└── assets/            # Images and other static assets
```

## Key Components

- `AuthContext`: Manages authentication state
- `ChatInterface`: Main chat UI with message bubbles
- `ChatHistory`: List of previous conversations
- `NavigationBar`: Bottom navigation for switching views
- `useChat`: Custom hook for chat state management
- `geminiService`: Integration with Gemini AI API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Gemini AI](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
