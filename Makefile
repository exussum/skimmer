build:
	docker build -t skimmer-worker worker
	docker build -t skimmer-worker-prod -f worker/Dockerfile.prod .
	docker build -t skimmer-fe react
	docker build -t skimmer-fe-prod -f react/Dockerfile.prod .
	docker build -t skimmer-api flask
	docker build -t skimmer-api-prod -f flask/Dockerfile.prod .

push:
	docker tag skimmer-api-prod 192.168.1.240:32000/skimmer-api-prod
	docker tag skimmer-fe-prod 192.168.1.240:32000/skimmer-fe-prod
	docker tag skimmer-worker-prod 192.168.1.240:32000/skimmer-worker-prod
	docker push 192.168.1.240:32000/skimmer-fe-prod
	docker push 192.168.1.240:32000/skimmer-api-prod
	docker push 192.168.1.240:32000/skimmer-worker-prod

source:
	cd flask && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-api sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd worker && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-worker sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd react && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-fe sh -c 'cp -r /app/node_modules/* /tmp/dependencies'

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
