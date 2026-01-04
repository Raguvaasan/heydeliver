# GitHub Copilot Instructions for HeyDeliver Admin Portal

## Project Overview
This is a React + TypeScript admin dashboard for HeyDeliver, built with Vite, using Flowbite React components, TailwindCSS, and Zustand for state management.

## Tech Stack
- **Framework**: React 18.2 + TypeScript 4.9
- **Build Tool**: Vite 3.2
- **UI Components**: Flowbite React, Flowbite
- **Styling**: TailwindCSS 3.2
- **State Management**: Zustand
- **Routing**: React Router DOM 6.4
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **Icons**: React Icons, Lucide React, React Feather
- **Charts**: ApexCharts, Chart.js, Recharts
- **Rich Text**: TipTap, React Quill
- **Notifications**: React Hot Toast, React Toastify

## Project Structure Guidelines

### Directory Organization
- `/src/pages/` - Page components organized by feature (Authentication, AccessManagement)
- `/src/layouts/` - Layout components (navbar, sidebar)
- `/src/store/` - Zustand stores for state management
- `/src/protectedRoutes/` - Route guards and authentication wrappers
- `/src/common/` - Utility functions (HTTP requests, query builders)
- `/src/context/` - React contexts (ThemeContext)
- `/src/utils/` - Helper utilities (permission checking)

### Code Style & Conventions

#### TypeScript
- Use TypeScript for all new files
- Define proper interfaces and types
- Use `FC` (FunctionComponent) type for React components
- Avoid `any` types unless absolutely necessary
- Use explicit return types for functions

#### Component Structure
```typescript
import { FC } from "react"
import { Button } from "flowbite-react"

interface ComponentNameProps {
  // Props definition
}

const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  )
}

export default ComponentName
```

#### State Management
- Use Zustand for global state
- Follow the store pattern in `/src/store/`
- Keep stores focused on specific features
- Example store structure:
```typescript
import { create } from "zustand"

interface StoreState {
  data: any
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
}

export const useStore = create<StoreState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchData: async () => {
    // Implementation
  }
}))
```

#### API Calls
- Use the `http` utility from `/src/common/httpRequest.ts`
- Keep API calls in store files
- Handle errors gracefully with try-catch
- Show user feedback with toast notifications

#### Authentication
- Auth token stored in `sessionStorage` as `authToken`
- Profile data stored as `profileData`
- Use `ProtectedRoute` wrapper for authenticated routes
- Use `ProtectedLogin` wrapper for login/register pages

#### Routing
- Base path is `/admin/`
- Use React Router DOM v6 patterns
- Protected routes require authentication
- Login redirects authenticated users to dashboard

#### Styling
- Use TailwindCSS utility classes
- Follow Flowbite React component patterns
- Responsive design: mobile-first approach
- Use `classnames` library for conditional classes

#### Forms
- Use Formik for form management
- Use Yup for validation schemas
- Show validation errors inline
- Display success/error toasts on submission

#### Error Handling
- Always catch async errors
- Display user-friendly error messages
- Use toast notifications for feedback
- Log errors for debugging when needed

## Environment Variables
- `VITE_API_URL` - Backend API endpoint
- `VITE_ENV` - Environment (dev/prod)
- Access via `import.meta.env.VITE_*`

## Installation & Setup

### Prerequisites
- Node.js >= 16
- npm >= 8 or yarn >= 1

### Installation Steps
1. Run `npm install --legacy-peer-deps`
2. Fix flowbite-react import: Change `GoThreeBars` to `GoDotFill` in `node_modules/flowbite-react/lib/esm/components/Navbar/NavbarToggle.js`
3. Create `.env` file with API configuration
4. Run `npm run dev` to start development server

### Known Issues
- Flowbite React has a dependency issue with react-icons
- Must use `--legacy-peer-deps` flag for installation
- Manual fix required in node_modules after installation (documented in readme.md)

## Development Commands
- `npm run dev` - Start development server with host access
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Code Generation Guidelines

### When creating new pages:
1. Create in appropriate feature folder under `/src/pages/`
2. Use TypeScript with proper typing
3. Wrap with `ProtectedRoute` if authentication required
4. Add route in `index.tsx`
5. Use Flowbite React components for UI
6. Implement form validation with Formik + Yup
7. Add loading states and error handling
8. Use toast notifications for user feedback

### When creating new stores:
1. Create in `/src/store/` directory
2. Use Zustand's `create` function
3. Define TypeScript interfaces for state
4. Include loading, error, and data states
5. Keep API calls within store actions

### When creating utility functions:
1. Place in `/src/utils/` or `/src/common/`
2. Use TypeScript with explicit types
3. Keep functions pure and testable
4. Export as named exports

### When working with permissions:
1. Use `checkPermission` utility from `/src/utils/`
2. Check permissions before rendering UI elements
3. Store role information in profile data

## Important Notes
- Base path is `/admin/` - all routes are relative to this
- Session storage is used for authentication (not localStorage)
- Multiple chart libraries available - choose based on requirements
- Rich text editors: TipTap (primary), React Quill (legacy)
- Use React Hot Toast for consistent notification styling
- The project uses ES modules (`"type": "module"` in package.json)

## Best Practices
1. Always use TypeScript strict mode
2. Handle loading and error states in UI
3. Provide user feedback for all actions
4. Keep components small and focused
5. Use semantic HTML
6. Ensure responsive design
7. Follow accessibility guidelines
8. Write self-documenting code with clear names
9. Add comments for complex logic
10. Keep dependencies up to date (check for vulnerabilities)

## Testing Considerations
- No test framework currently configured
- Consider adding Jest + React Testing Library
- Write unit tests for utilities
- Write integration tests for critical flows
- Test authentication flows thoroughly

## Security Considerations
- Auth tokens in sessionStorage (consider httpOnly cookies)
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement CSRF protection
- Regular security audits with `npm audit`
