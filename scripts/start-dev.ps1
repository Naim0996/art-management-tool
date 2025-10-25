# Start Development Environment
# Loads .env.development and starts docker-compose.development.yml

docker-compose --env-file .env.development -f docker-compose.development.yml up $args