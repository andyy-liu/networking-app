# Networking App

A modern web application for managing professional contacts, tasks, and networking relationships. Built with React, TypeScript, and Supabase.

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

## Testing

### Unit Tests

- Component rendering tests
- State management tests
- Utility function tests

### Integration Tests

- Authentication flows
- CRUD operations
- Real-time updates

### End-to-End Tests

- User journeys
- Critical paths
- Edge cases

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

## Deployment

### Production Build

1. Run `npm run build`
2. Deploy the `dist` directory to your hosting service
3. Configure environment variables
4. Set up Supabase project for production

### Environment Variables

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_API_URL`: API endpoint (if applicable)

## Special Considerations

### Security

- All database operations are authenticated
- Row-level security policies in Supabase
- Protected routes for authenticated users
- Secure storage of sensitive data

### Performance

- Lazy loading of components
- Optimized database queries
- Efficient state management
- Caching strategies

### Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support
- Progressive enhancement

## Contributing

### Code Style

- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write meaningful comments

### Git Workflow

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

## Troubleshooting

### Common Issues

- Authentication problems
- Real-time sync issues
- Database connection errors
- Build failures

### Debugging

- Check browser console
- Verify environment variables
- Test database connections
- Monitor network requests

## License

MIT License - see LICENSE file for details

## Support

For support, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue if needed
4. Contact the maintainers

## Acknowledgments

- Supabase team for the backend infrastructure
- React team for the frontend framework
- All contributors to the project
