build:
	docker compose build
	docker compose up
	$(MAKE) migrate

clean:
	docker compose down -v

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
