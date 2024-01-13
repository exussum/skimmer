#!/bin/bash

WHERE="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
STACK=$1
cat $WHERE/../../*/.env | sort | uniq | grep = | sed -e 's/=/ /' | awk -v stack=$STACK '{ print "pulumi --stack " stack " config set --secret " $1 " " $2 }'
