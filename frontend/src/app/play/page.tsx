"use client";

import Script from 'next/script';

import {
    Box,
    Button,
    Center,
    Group,
    Image,
    NumberInput,
    Radio,
    SegmentedControl,
    Stack,
    Tabs,
    Text,
    TextInput,
    Title,
    Loader,
    useMantineTheme,
} from "@mantine/core";
import useDownloader from "react-use-downloader";
import { FC, useState } from "react";

var cartridgeData;
var rivlogData;

const PlayGame: FC = () => {
    const theme = useMantineTheme();
    const [overallScore, setOverallScore] = useState(0);
    const [isDownloadAvailable, setDownloadAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playBtnText, setPlayBtnText] = useState("Start");

    const { download } = useDownloader();

    async function get_cartridge() {
        let res = await fetch("/doom.sqfs");
        return new Uint8Array(await res.arrayBuffer());
    }

    async function rivemuStart() {
        console.log('rivemuStart');
        setIsLoading(true);
        setDownloadAvailable(false);
        setIsPlaying(true);
        setPlayBtnText("Restart");
        // @ts-ignore:next-line
        if (Module.quited) { // restart wasm when back to page
            // @ts-ignore:next-line
            Module._main();
        }
        if (!cartridgeData) {
            // @ts-ignore:next-line
            cartridgeData = await get_cartridge();
        } else {
            // wait spinner animation to show up
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // @ts-ignore:next-line
        let buf = Module._malloc(cartridgeData.length);
        // @ts-ignore:next-line
        Module.HEAPU8.set(cartridgeData, buf);
        // TODO: build params from inspect state
        let difficulty = 3;
        let level = 2;
        let params = "-iwad doom1.wad -skill "+difficulty+" -warp 1 "+level+" -levelquit "+level+" -deathquit -nowipe -nomenu";
        // @ts-ignore:next-line
        Module.ccall('rivemu_start_ex', null, [ 'number', 'number', 'string' ], [ buf, cartridgeData.length, params ]);
        // @ts-ignore:next-line
        Module._free(buf);
    }

    function rivemuStop() {
        setIsPlaying(false);
        console.log('rivemuStop');
        // @ts-ignore:next-line
        Module.cwrap('rivemu_stop')();
    }

    function rivemuDownloadGameplay() {
        const filename = "gameplay.rivlog";
        const blobFile = new Blob([rivlogData],{type:'application/octet-stream'});
        const file = new File([blobFile], filename);
        const urlObj = URL.createObjectURL(file);
        console.log("Gameplay Downloaded!");
        download(urlObj, filename);
        rivlogData = rivlogData;
    }

    if (typeof window !== "undefined") {
        let decoder = new TextDecoder();
        // @ts-ignore:next-line
        window.rivemu_on_outcard_update = function(outcard : any) {
            let outcard_str = decoder.decode(outcard);
            let score = JSON.parse(outcard_str.substring(4)).score;
            setOverallScore(score);
        }

        // @ts-ignore:next-line
        window.rivemu_on_begin = function(width : any, height : any) {
            console.log("rivemu_on_begin");
            setIsLoading(false);
            // force canvas resize
            window.dispatchEvent(new Event('resize'));
        }

        // @ts-ignore:next-line
        window.rivemu_on_finish = function(rivlog : ArrayBuffer, outcard : ArrayBuffer) {
            console.log('rivemu_on_finish');
            rivlogData = new Uint8Array(rivlog);
            setDownloadAvailable(true);
        }
    }
    return (
        <Center>
            <Stack align="center" mt={20}>
                <canvas id="canvas"
                    height={400}
                    width={640}
                    onContextMenu={(e)=> e.preventDefault()}
                    tabIndex={1}/>
                <Text size="lg" fw={700}>Score: {overallScore}</Text>
                <Group>
                    {isLoading && <Loader/>}
                    <Button onKeyDown={(e)=> e.preventDefault()} onClick={rivemuStart}>{playBtnText}</Button>
                    <Button onKeyDown={(e)=> e.preventDefault()} onClick={rivemuStop} disabled={!isPlaying}>Stop</Button>
                    <Button onKeyDown={(e)=> e.preventDefault()} onClick={rivemuDownloadGameplay} disabled={!isDownloadAvailable}>Download Gameplay</Button>
                </Group>
            </Stack>
            <Script src="/rivemu.js" strategy="lazyOnload"/>
        </Center>
    );
};

export default PlayGame;
