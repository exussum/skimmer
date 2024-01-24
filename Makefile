export DOCKER_BUILDKIT = 1

build:
	docker buildx build --platform=linux/arm64/v8,linux/amd64 --push --progress plain -t registry.exussum.org:32000/skimmer-worker worker
	docker buildx build --platform=linux/arm64/v8,linux/amd64 --push --progress plain -t registry.exussum.org:32000/skimmer-worker-prod  -f worker/Dockerfile.prod .
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-fe react
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-fe-prod -f react/Dockerfile.prod .
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-api flask
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-api-prod -f flask/Dockerfile.prod .
push:
	docker tag skimmer-api-prod registry.exussum.org:32000/skimmer-api-prod
	docker tag skimmer-fe-prod registry.exussum.org:32000/skimmer-fe-prod
	docker tag skimmer-worker-prod registry.exussum.org:32000/skimmer-worker-prod
	docker push registry.exussum.org:32000/skimmer-fe-prod
	docker push registry.exussum.org:32000/skimmer-api-prod
	docker push registry.exussum.org:32000/skimmer-worker-prod

source:
	cd flask && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-api sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd worker && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-worker sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd react && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-fe sh -c 'cp -r /app/node_modules/* /tmp/dependencies'

migrate:
	cd tf; atlas migrate hash; atlas migrate apply --env local
