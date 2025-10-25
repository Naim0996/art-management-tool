# Development stage
FROM golang:1.24-alpine AS development

# Install tools for development
RUN apk --no-cache add ca-certificates git curl

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Run the application with go run for development
CMD ["go", "run", "."]

# Build stage for production
FROM golang:1.24-alpine AS builder

# Install ca-certificates for downloading dependencies
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy all source code including vendor if exists
COPY . .

# Download dependencies (with vendor fallback)
RUN go mod download || go mod vendor

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o art-backend .

# Production runtime stage
FROM alpine:latest AS production

RUN apk --no-cache add ca-certificates curl

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/art-backend .

# Expose port
EXPOSE 8080

# Run the application
CMD ["./art-backend"]
