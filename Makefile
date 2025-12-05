start: docker-compose up -d

stop: docker-compose down

bash: ##Executes bash command and jumps into the container
	docker-compose exec -it certs_fe-frontend-1 sh