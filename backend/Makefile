all: submodules downloads riv-toolchain sunodo-sdk-riv image

image:
	sunodo build

submodules:
	git submodule update --init --recursive

downloads:
	wget -O doom.sqfs https://github.com/edubart/riv/releases/download/downloads/doom.sqfs

riv-toolchain:
	make -C riv download-images toolchain

sunodo-sdk-riv:
	docker build --tag sunodo/sdk:0.2.0-riv --file sunodo-sdk.Dockerfile --progress plain .
