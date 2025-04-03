# Inventory Management Frontend

A React TypeScript application for managing products, orders, and reservations. This frontend connects to RESTful backend controllers to provide a complete inventory management solution.

## Features

- **Products Management**: Create, view, edit, and delete products
- **Orders Management**: Create orders, mark as paid, cancel orders, and view order details
- **Reservations Management**: Create, confirm, cancel, and track reservations
- **Material UI**: Modern and responsive UI using Material UI components
- **TypeScript**: Type safety and improved development experience

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/inventory-management-frontend.git
cd inventory-management-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure API URL
   Create a `.env` file in the root directory and add:
```
REACT_APP_API_URL=http://localhost:8080
```
Adjust the URL to match your backend API server.

4. Start the development server
```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── api/                 # API client and service methods
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── theme/               # Material UI theme configuration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── routes.tsx           # Application routes
```

## API Integration

The application is designed to connect to a REST API with the following endpoints:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create a new order
- `POST /api/orders/{id}/pay` - Mark an order as paid
- `POST /api/orders/{id}/cancel` - Cancel an order

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/{id}` - Get reservation by ID
- `POST /api/reservations` - Create a new reservation
- `POST /api/reservations/{id}/confirm` - Confirm a reservation
- `POST /api/reservations/{id}/cancel` - Cancel a reservation

## Tech Stack

- **React**: Frontend library
- **TypeScript**: Programming language
- **Material UI**: UI component library
- **React Router**: Navigation and routing
- **Axios**: HTTP client
- **Date-fns**: Date manipulation
- **React Hook Form**: Form handling (optional addition)

## Development

### Adding New Features

1. Define the types in the appropriate file under `src/types/`
2. Add API methods in the corresponding service file under `src/api/`
3. Create or update the custom hook in `src/hooks/`
4. Create the UI components in `src/components/`
5. Implement the page component in `src/pages/`
6. Add the route in `src/routes.tsx`

### Code Style

- Use functional components with hooks
- Follow established patterns for data fetching, state management, and error handling
- Keep components focused on a single responsibility
- Use TypeScript types for props, state, and API responses

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with optimized production files that can be deployed to any static hosting service.

## License

[MIT](LICENSE)