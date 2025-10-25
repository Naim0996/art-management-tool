# Start Test Environment
# Loads .env.test and starts docker-compose.test.yml

docker-compose --env-file .env.test -f docker-compose.test.yml up $args