# RALFeedback: AI-Powered Restaurant Feedback Analysis

This is a Next.js application built in Firebase Studio. It provides a platform for analyzing customer and employee feedback for various fast-food restaurants, leveraging generative AI to provide actionable insights.

## Application Architecture & Tech Stack

This application is a modern, full-stack web application built on the following technologies:

- **Frontend Framework**: **Next.js** with **React** and **TypeScript**, using the App Router for efficient, server-centric rendering.
- **UI Components**: A combination of **ShadCN UI** for pre-built, accessible components and **Tailwind CSS** for custom styling. This allows for rapid development of a polished, professional user interface.
- **Backend & Database**: **Firebase** serves as the backend, with **Firestore** as the NoSQL database for storing all restaurant, feedback, and user data.
- **Authentication**: **Firebase Authentication** provides a secure login system for the admin dashboard.
- **Generative AI**: **Genkit**, Google's generative AI toolkit, powers all AI features, including sentiment analysis, feedback summarization, and quality scoring.

## Progress Tracker

This section documents the key features, enhancements, and bug fixes implemented in the application.

### Core Features
- **Restaurant & Feedback System**: Users can select restaurants and view customer and employee feedback, separated by tabs.
- **"Fawud" Upvoting**: A system for users to upvote feedback, with a limit of 3 fawuds per user per comment.
- **Admin Dashboard**: A secure area for administrators to view aggregated data, manage feedback, and gain insights.
- **User Authentication**: A login system protects the admin dashboard.
- **Email Subscription**: A popup dialog allows users to subscribe to a mailing list, with data saved to Firestore.
- **Comprehensive CSV Export**: Admins can download all feedback data, including AI analysis, for offline use.

### AI & Genkit Integration
- **Sentiment Analysis**: New feedback is automatically analyzed for sentiment, influencing a restaurant's average score.
- **AI-Powered Summarization**: Admins can generate on-demand summaries of all feedback for a restaurant.
- **AI Feedback Scoring**: Individual feedback items can be scored by an AI for quality and relevance.
- **AI Improvement Suggestions**: The admin dashboard proactively suggests areas for improvement based on feedback volume.

### Performance & UI Enhancements
- **Efficient Pagination**: Implemented a robust pagination system ("Load More") that loads feedback in batches, ensuring fast initial load times and a smooth user experience.
- **Responsive State Management**: Refactored application state to be a single source of truth, eliminating UI bugs and ensuring data consistency.
- **Polished Admin UI**: The admin dashboard was redesigned for better layout, clarity, and proactive insights.
- **Dynamic Content Loading**: Implemented skeleton loaders and specific loading states for a better user experience during data fetching.
- **Clearer Tab Counts**: Added feedback counts to the tabs in the feedback section for better clarity.
- **Professional Footer**: Updated the application footer with a copyright symbol and improved layout.

### Key Bug Fixes
- **Comment Duplication**: Resolved a state synchronization issue that caused comments to appear duplicated after submission.
- **"Fawud" UI Glitch**: Fixed a bug where "Fawud" counts updated in the database but did not reflect on the UI in real-time.
- **"Load More" Button Logic**: Corrected the pagination logic to ensure the "Load More" button appears reliably and only for the correct feedback category.
- **"Load More" State Bug**: Fixed an issue where the loading state of one feedback tab interfered with the functionality of another.
