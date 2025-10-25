# Start Production Environment
# Loads .env.production and starts docker-compose.production.yml

docker-compose --env-file .env.production -f docker-compose.production.yml up $args