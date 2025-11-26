# Ping - Networking App

A web app for managing contacts, tasks, and networking relationships. Built with React, TypeScript, and Supabase.

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
