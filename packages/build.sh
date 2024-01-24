docker buildx build --platform=linux/arm64/v8 --load -t skimmer-packages-arm .
docker buildx build --platform=linux/amd  --load -t skimmer-packages-x86 .
