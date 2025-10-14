# Contributing to Art Management Tool

Thank you for considering contributing to this project! This document provides guidelines for contributing.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Naim0996/art-management-tool.git
   cd art-management-tool
   ```

2. Set up the backend:
   ```bash
   cd backend
   go mod download
   go run main.go
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Project Structure

```
art-management-tool/
├── backend/              # Go backend API
│   ├── handlers/         # HTTP request handlers
│   ├── middleware/       # Middleware functions
│   ├── models/           # Data models
│   └── main.go           # Application entry point
├── frontend/             # Next.js frontend
│   └── app/              # Next.js app directory
│       ├── admin/        # Admin pages
│       ├── shop/         # Customer shop pages
│       ├── cart/         # Shopping cart
│       └── checkout/     # Checkout flow
└── infrastructure/       # Terraform IaC
    ├── main.tf           # Main infrastructure
    ├── variables.tf      # Variables
    └── outputs.tf        # Outputs
```

## Code Style

### Backend (Go)
- Follow standard Go formatting (`gofmt`)
- Use meaningful variable and function names
- Add comments for exported functions
- Keep functions small and focused

### Frontend (TypeScript/React)
- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and reusable
- Use Tailwind CSS for styling

## Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm run test
```

## Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request

## Pull Request Guidelines

- Provide a clear description of the changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single feature or fix

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

## Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Provide detailed use cases
- Explain why the feature would be useful

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions about contributing!
