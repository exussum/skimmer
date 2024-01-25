docker buildx build --platform=linux/arm64/v8 --progress plain --load -t skimmer-packages-arm .
docker buildx build --platform=linux/amd64 --progress plain --load -t skimmer-packages-x86 .
