"""A Kubernetes Python Pulumi program"""

from collections import namedtuple as nt

import pulumi
from pulumi_kubernetes.apps.v1 import Deployment, DeploymentSpecArgs
from pulumi_kubernetes.core.v1 import (
    ContainerArgs,
    EnvVarArgs,
    PodSpecArgs,
    PodTemplateSpecArgs,
    Service,
    ServicePortArgs,
    ServiceSpecArgs,
)
from pulumi_kubernetes.core.v1.outputs import EnvVar
from pulumi_kubernetes.meta.v1 import LabelSelectorArgs, ObjectMetaArgs

REGISTRY = "192.168.1.240:32000"
config = pulumi.Config()


def get_vars(x):
    return [EnvVar(name=v, value=config.get_secret(v)) for v in x]


def short_deployment(config):
    Deployment(
        config.name,
        spec=DeploymentSpecArgs(
            selector=LabelSelectorArgs(match_labels=config.selector),
            replicas=config.replicas,
            revision_history_limit=0,
            template=PodTemplateSpecArgs(
                metadata=ObjectMetaArgs(labels=config.selector),
                spec=PodSpecArgs(
                    containers=[
                        ContainerArgs(
                            name=config.name,
                            image=config.image_name,
                            env=get_vars(config.env_vars) + config.env_var_args,
                        )
                    ]
                ),
            ),
        ),
    )


def short_service(config, port_mapping, external_ips):
    Service(
        config.name,
        metadata=ObjectMetaArgs(labels=config.selector, name=config.name),
        spec=ServiceSpecArgs(
            ports=[ServicePortArgs(name=f"port-{k}", port=k, target_port=v) for (k, v) in port_mapping.items()],
            external_ips=external_ips,
            type="ClusterIP",
            selector=config.selector,
        ),
    )


class Api:
    selector = {"app": "skimmer-api"}
    name = "skimmer-api"
    image_name = f"{REGISTRY}/skimmer-api-prod:latest"
    env_vars = [
        "CHANNEL_GOOGLE_REDIRECT_URL",
        "FLASK_PERMANENT_SESSION_LIFETIME",
        "FLASK_SQLALCHEMY_DATABASE_URI",
        "FLASK_SECRET_KEY",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URL",
        "MEMCACHED_KEY_PREFIX",
        "MEMCACHED_SERVER",
        "REACT_HOME_URL",
    ]
    env_var_args = []
    replicas = 2


class Fe:
    selector = {"app": "skimmer-fe"}
    name = "skimmer-fe"
    image_name = f"{REGISTRY}/skimmer-fe-prod:latest"
    env_vars = []
    env_var_args = []
    replicas = 2


class Memcache:
    selector = {"app": "skimmer-memcache"}
    name = "skimmer-memcache"
    image_name = "memcached:1.6.22-alpine"
    env_vars = []
    env_var_args = [EnvVarArgs(name="MEMCACHED_MEMORY_LIMIT", value="1")]
    replicas = 1


class RabbitMQ:
    selector = {"app": "skimmer-rabbitmq"}
    name = "skimmer-rabbitmq"
    image_name = "rabbitmq:3.12.10-alpine"
    env_vars = []
    env_var_args = []
    replicas = 1


short_deployment(RabbitMQ)
short_service(RabbitMQ, {5672: 5672}, [])

short_deployment(Memcache)
short_service(Memcache, {11211: 11211}, [])

short_deployment(Api)
short_service(Api, {8000: 8000}, [])

short_deployment(Fe)
short_service(Fe, {443: 443}, ["192.168.1.240"])
