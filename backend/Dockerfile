# syntax=docker.io/docker/dockerfile:1.4
FROM --platform=linux/riscv64 riv/toolchain:devel AS riv-toolchain
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

LABEL io.sunodo.sdk_version=0.2.0-riv
LABEL io.cartesi.rollups.ram_size=128Mi

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.12.0
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends busybox-static=1:1.30.1-7ubuntu3 ca-certificates=20230311ubuntu0.22.04.1 curl=7.81.0-1ubuntu1.13 git=1:2.34.1-1ubuntu1.10
curl -fsSL https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz \
  | tar -C / --overwrite -xvzf -
rm -rf /var/lib/apt/lists/*
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

# install riv rootfs
COPY rivos.tar /rivos.tar
RUN tar -C / -xf /rivos.tar && mv /rootfs /rivos && rm -f rivos.tar
RUN cp /rivos/etc/sysctl.conf /etc/sysctl.conf
RUN mkdir -p /rivos/cartridges
COPY doom.sqfs /rivos/cartridges/doom.sqfs

# install custom init
RUN cp /rivos/sbin/init /opt/cartesi/bin/init

# install musl libc
RUN ln -s /rivos/lib/ld-musl-riscv64.so.1 /lib/

# install riv-chroot
RUN ln -s /rivos/usr/bin/bwrap /usr/bin/ && \
    ln -s /rivos/usr/lib/libcap.so.2 /usr/lib/ && \
    ln -s /rivos/sbin/riv-chroot /sbin/

WORKDIR /opt/cartesi/dapp
COPY ./requirements.txt .

RUN <<EOF
pip install -r requirements.txt --no-cache
find /usr/local/lib -type d -name __pycache__ -exec rm -r {} +
EOF

COPY ./cartesi cartesi
COPY ./doom_arena doom_arena
COPY ./dapp.py .

ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

ENTRYPOINT ["rollup-init"]
CMD ["python3", "dapp.py"]