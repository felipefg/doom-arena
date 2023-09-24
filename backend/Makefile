all: downloads sunodo-sdk-riv image

image:
	sunodo build

sunodo-sdk-riv:
	docker build --tag sunodo/sdk:0.2.0-riv --file sunodo-sdk.Dockerfile --progress plain .

downloads:
	wget -O doom.sqfs https://github.com/edubart/riv/releases/download/downloads/doom.sqfs
	wget -O rivos.tar https://github.com/edubart/riv/releases/download/downloads/rootfs.tar
	wget -O linux.bin https://github.com/edubart/riv/releases/download/downloads/linux.bin
