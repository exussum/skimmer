build:
	docker build --platform=linux/arm64 -t skimmer-api flask
	docker build --platform=linux/arm64 -t skimmer-api-prod -f flask/Dockerfile.prod .
	docker build --platform=linux/arm64 -t skimmer-worker worker
	docker build --platform=linux/arm64 -t skimmer-worker-prod -f worker/Dockerfile.prod .
	docker build --platform=linux/arm64 -t skimmer-fe react
	docker build --platform=linux/arm64 -t skimmer-fe-prod -f react/Dockerfile.prod .

push:
	docker tag skimmer-api-prod registry.exussum.org:32000/skimmer-api-prod
	docker tag skimmer-fe-prod registry.exussum.org:32000/skimmer-fe-prod
	docker tag skimmer-worker-prod registry.exussum.org:32000/skimmer-worker-prod
	docker push registry.exussum.org:32000/skimmer-fe-prod
	docker push registry.exussum.org:32000/skimmer-api-prod
	docker push registry.exussum.org:32000/skimmer-worker-prod

source:
	cd flask && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-api sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd worker && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-worker sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd react && docker run -ti -v ./dependencies:/tmp/dependencies skimmer-fe sh -c 'cp -r /app/node_modules/* /tmp/dependencies'

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
