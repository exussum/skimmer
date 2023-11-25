build:
	docker compose build

clean:
	docker compose down -v

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
