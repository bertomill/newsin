# Newsin

A modern, elegant news application with AI-powered features, inspired by the clean and world-class design of ElevenLabs.

## Tech Stack

Newsin is built with a powerful and modern tech stack:

- **Frontend Framework**: [Next.js](https://nextjs.org) - React framework for server-side rendering and static site generation
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - High-quality, accessible, and customizable UI components
- **Backend & Authentication**: [Firebase](https://firebase.google.com/) - For authentication, database, and hosting
- **AI Integration**: 
  - [Firebase Vertex AI](https://firebase.google.com/docs/vertexai) - Gemini AI integration directly through Firebase
  - [Perplexity API](https://www.perplexity.ai/) - Real-time internet search and information retrieval
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development

## Design Philosophy

Newsin follows a minimalist, elegant design approach inspired by [ElevenLabs](https://elevenlabs.io/app/speech-synthesis/text-to-speech), focusing on:

- **Simplicity**: Clean interfaces with focused functionality
- **Elegance**: Refined typography and spacing for optimal readability
- **World-class UX**: Intuitive navigation and seamless interactions

## Implementation Details

- **Authentication**: Firebase Authentication for user management
- **Database**: Firestore for storing user preferences and article data
- **AI Features**: 
  - Gemini AI via Firebase Vertex AI for content summarization, personalized recommendations, and chat functionality
  - Perplexity API for real-time news search and up-to-date information retrieval
- **UI Framework**: shadcn/ui components styled with Tailwind CSS for a consistent and elegant interface
- **Responsive Design**: Mobile-first approach ensuring a seamless experience across all devices

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
