pulumi stack select dev -c

pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-api default/skimmer-api
pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-worker default/skimmer-worker
pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-memcache default/skimmer-memcache
pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-rabbitmq default/skimmer-rabbitmq
pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-fe default/skimmer-fe
pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Service skimmer-db default/skimmer-db

pulumi import -y --generate-code=false --protect=false kubernetes:core/v1:Endpoints skimmer-fe default/skimmer-db

pulumi import -y --generate-code=false --protect=false kubernetes:apps/v1:Deployment skimmer-api skimmer-api
pulumi import -y --generate-code=false --protect=false kubernetes:apps/v1:Deployment skimmer-worker skimmer-worker
pulumi import -y --generate-code=false --protect=false kubernetes:apps/v1:Deployment skimmer-memcache skimmer-memcache
pulumi import -y --generate-code=false --protect=false kubernetes:apps/v1:Deployment skimmer-rabbitmq skimmer-rabbitmq
pulumi import -y --generate-code=false --protect=false kubernetes:apps/v1:Deployment skimmer-fe skimmer-fe
