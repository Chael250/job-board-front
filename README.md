# Job Board Frontend

A modern Next.js frontend application for the Job Board platform, built with TypeScript, Tailwind CSS, and comprehensive authentication management.

## Features

- **Next.js 14+** with App Router for optimal performance and SEO
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for responsive and modern UI design
- **JWT Authentication** with automatic token refresh
- **Role-based Access Control** (Admin, Company, Job Seeker)
- **Secure API Client** with interceptors and error handling
- **Responsive Design** optimized for mobile and desktop

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Authentication**: JWT with refresh tokens
- **State Management**: React Context API
- **Cookie Management**: js-cookie

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_JWT_REFRESH_THRESHOLD=300000
NEXT_PUBLIC_TOKEN_STORAGE_KEY=job_board_token
NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY=job_board_refresh_token
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── auth/              # Authentication components
│   └── ui/                # Base UI components
├── contexts/              # React contexts
│   └── auth.context.tsx   # Authentication context
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api-client.ts      # HTTP client with interceptors
│   └── auth-utils.ts      # Authentication utilities
├── services/              # API service layers
│   └── auth.service.ts    # Authentication service
└── types/                 # TypeScript type definitions
    └── auth.ts            # Authentication types
```

## Authentication System

The frontend implements a comprehensive authentication system with:

### Features
- **JWT Token Management**: Automatic token storage and refresh
- **Role-based Access Control**: Support for Admin, Company, and Job Seeker roles
- **Automatic Token Refresh**: Seamless token renewal before expiration
- **Secure Storage**: HTTP-only cookies for token storage
- **Route Protection**: HOCs and hooks for protecting routes

### Usage

#### Using the Auth Context
```tsx
import { useAuth } from '@/contexts/auth.context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Component logic
}
```

#### Protecting Routes
```tsx
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { UserRole } from '@/types/auth';

function AdminPage() {
  const { isLoading } = useProtectedRoute({ 
    requiredRole: UserRole.ADMIN 
  });
  
  if (isLoading) return <Loading />;
  
  // Admin-only content
}
```

#### Using the API Client
```tsx
import { apiClient } from '@/lib/api-client';

// GET request
const jobs = await apiClient.get('/jobs');

// POST request with authentication
const newJob = await apiClient.post('/jobs', jobData);

// File upload
const result = await apiClient.uploadFile('/files/resume', file);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `10000` |
| `NEXT_PUBLIC_JWT_REFRESH_THRESHOLD` | Token refresh threshold (ms) | `300000` |
| `NEXT_PUBLIC_TOKEN_STORAGE_KEY` | Access token cookie key | `job_board_token` |
| `NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY` | Refresh token cookie key | `job_board_refresh_token` |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum file upload size | `5242880` |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Allowed file MIME types | PDF, DOCX, DOC |

## Security Features

- **Secure Cookie Storage**: Tokens stored in secure, HTTP-only cookies
- **Automatic Token Refresh**: Prevents session expiration
- **CSRF Protection**: SameSite cookie attributes
- **XSS Protection**: Content Security Policy headers
- **Input Validation**: Client-side validation with server-side verification

## Development Guidelines

### Code Style
- Use TypeScript for all components and utilities
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling with custom design system
- Implement proper error handling and loading states

### Component Structure
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper TypeScript interfaces
- Follow accessibility best practices

### API Integration
- Use the provided API client for all HTTP requests
- Handle loading and error states consistently
- Implement proper error boundaries
- Use React Query for complex data fetching (future enhancement)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Test authentication flows thoroughly
4. Ensure responsive design works on all devices
5. Update documentation for new features

## License

This project is part of the Job Board application suite.