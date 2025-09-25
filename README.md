# Ping - Networking App

Fun little project I did over the summer! First time doing a coding project that lasted longer than a couple of days - lots of vibe coding but learned a lot (keep in mind to not rely on AI too much for the future)...
A web app for managing professional contacts, tasks, and networking relationships. Built with React, TypeScript, and Supabase.

## Core Features

### Contact Management

- Create, read, update, and delete contacts
- Add custom tags to contacts
- Track contact status (Reached Out, Responded, Chatted)
- Group contacts into custom categories
- Add notes and todos to contacts
- Import contacts from CSV or Excel files

### Todo System

- Create todos associated with contacts
- Set due dates and completion status
- View all todos across contacts
- Filter and sort todos
- Real-time updates for todo status

### Group Management

- Create and manage contact groups
- Add/remove contacts from groups
- View group-specific contact lists
- Group-level operations

## Architecture

### Frontend

- **Framework**: React with TypeScript
- **State Management**: React Context API for global state
- **Routing**: React Router for navigation
- **UI Components**: Custom components built with Tailwind CSS
- **Data Fetching**: Supabase client for real-time database operations

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for file attachments

## Data Flow

### Authentication Flow

1. User signs in/up through Supabase Auth
2. Auth state is managed through AuthContext
3. Protected routes ensure authenticated access
4. Session persistence across page reloads

### Contact Management Flow

1. Contacts are fetched on initial load
2. Real-time updates sync changes across clients
3. Contact data includes todos, notes, and tags
4. Changes are immediately reflected in the UI

### Todo Management Flow

1. Todos are associated with specific contacts
2. Global todo view shows all todos across contacts
3. Todo updates sync in real-time
4. Due dates and completion status are tracked

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with Supabase credentials
4. Start the development server: `npm run dev`

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run tests
- `npm run lint`: Run linter
- `npm run format`: Format code
