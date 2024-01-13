FROM python:3.11.6-alpine3.18
WORKDIR /app
ENV PULUMI_CONFIG_PASSPHRASE_FILE /app/.passwd
ENV NO_COLOR 1
COPY requirements.txt .
RUN ls -l
RUN \
    pip install -r requirements.txt && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    apk --update add curl kubectl && \
    mkdir -p /root/.kube && \
    touch kubeconfig && \
    ln -s /app/kubeconfig /root/.kube/config && \
    curl -v https://release.ariga.io/atlas/atlas-linux-amd64-latest > /usr/bin/atlas && \
    chmod +x /usr/bin/atlas && \
    curl -v https://get.pulumi.com/releases/sdk/pulumi-v3.100.0-linux-x64.tar.gz > /tmp/pulimi.tgz && \
    tar xzvf /tmp/pulimi.tgz -C /tmp && \
    mv /tmp/pulumi/* /usr/bin && \
    /usr/bin/pulumi login --local && \
    /usr/bin/pulumi plugin install resource kubernetes
ENTRYPOINT /bin/sh