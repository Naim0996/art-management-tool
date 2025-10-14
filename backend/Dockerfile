# Build stage
FROM golang:1.24-alpine AS builder

# Install ca-certificates for downloading dependencies
RUN apk --no-cache add ca-certificates || true

WORKDIR /app

# Copy all source code including vendor if exists
COPY . .

# Download dependencies (with vendor fallback)
RUN go mod download || go mod vendor || true

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o art-backend .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl || true

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/art-backend .

# Expose port
EXPOSE 8080

# Run the application
CMD ["./art-backend"]
