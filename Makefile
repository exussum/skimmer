export DOCKER_BUILDKIT = 1

build_worker:
	docker buildx build --platform=linux/arm64/v8 --progress plain -o /tmp/skimmer-worker-arm -t skimmer-worker-arm worker
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-worker-prod --build-context="skimmer-worker-arm=/tmp/skimmer-worker-arm" --load -f worker/Dockerfile.prod .
build_api:
	docker buildx build --platform=linux/arm64/v8 --progress plain -o /tmp/skimmer-api-arm    -t skimmer-api-arm flask
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-api-prod    --build-context="skimmer-api-arm=/tmp/skimmer-api-arm"       --load -f flask/Dockerfile.prod .
build_fe:
	docker buildx build --platform=linux/arm64/v8 --progress plain -o /tmp/skimmer-fe-arm     -t skimmer-fe-arm react
	docker buildx build --platform=linux/arm64/v8 --progress plain -t skimmer-fe-prod     --build-context="skimmer-fe-arm=/tmp/skimmer-fe-arm"         --load -f react/Dockerfile.prod .
push_worker:
	docker tag skimmer-worker-prod registry.exussum.org:32000/skimmer-worker-prod
	docker push registry.exussum.org:32000/skimmer-worker-prod
push_api:
	docker tag skimmer-api-prod registry.exussum.org:32000/skimmer-api-prod
	docker push registry.exussum.org:32000/skimmer-api-prod
push_fe:
	docker tag skimmer-fe-prod registry.exussum.org:32000/skimmer-fe-prod
	docker push registry.exussum.org:32000/skimmer-fe-prod

source:
	cd flask && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-api sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd worker && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-worker sh -c 'cp -r /usr/local/lib/python3.11/site-packages/* /tmp/dependencies'
	cd react && docker run --progress plain -ti -v ./dependencies:/tmp/dependencies skimmer-fe sh -c 'cp -r /app/node_modules/* /tmp/dependencies'

migrate:
	cd k8s; atlas migrate hash; atlas migrate apply --env local
