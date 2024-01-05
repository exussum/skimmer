build:
	docker build -t skimmer-api flask
	docker build -t skimmer-worker worker
	docker build -t skimmer-fe react

source:
	cd flask && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-api sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd worker && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-worker sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
