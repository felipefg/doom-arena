"use client";
import Script from "next/script";
import {
    Badge,
    Button,
    Center,
    Collapse,
    Group,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import useDownloader from "react-use-downloader";
import { FC, useState } from "react";
import {
    TbDownload,
    TbPlayerPlayFilled,
    TbPlayerSkipBackFilled,
    TbPlayerStopFilled,
} from "react-icons/tb";

import { useInspect } from "../../../hooks/inspect";
import { Contest } from "../../../model";
import { useDisclosure } from "@mantine/hooks";
import { JoinContest } from "../../../components/JoinContest";
import { Address } from "viem";

let cartridgeData: Uint8Array | undefined = undefined;
let rivlogData: Uint8Array | undefined = undefined;

type PlayContextGameParams = {
    params: { contest_id: string };
};

const PlayContestGame: FC<PlayContextGameParams> = ({
    params: { contest_id },
}) => {
    const {
        report: contest,
        error,
        data,
    } = useInspect<Contest>(`/contest/${contest_id}`);

    const [overallScore, setOverallScore] = useState(0);
    const [isDownloadAvailable, setDownloadAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [join, { toggle }] = useDisclosure();

    const { download } = useDownloader();

    async function get_cartridge() {
        let res = await fetch("/doom.sqfs");
        return new Uint8Array(await res.arrayBuffer());
    }

    async function rivemuStart() {
        console.log("rivemuStart");
        setIsLoading(true);
        setDownloadAvailable(false);
        setIsPlaying(true);
        // @ts-ignore:next-line
        if (Module.quited) {
            // restart wasm when back to page
            // @ts-ignore:next-line
            Module._main();
        }
        if (!cartridgeData) {
            cartridgeData = await get_cartridge();
        } else {
            // wait spinner animation to show up
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        // @ts-ignore:next-line
        let buf = Module._malloc(cartridgeData.length);
        // @ts-ignore:next-line
        Module.HEAPU8.set(cartridgeData, buf);
        let difficulty = contest.difficulty;
        let level = contest.level;
        let params = `-iwad doom1.wad -skill ${difficulty} -warp 1 ${level} -levelquit ${level} -deathquit -nowipe -nomenu`;
        // @ts-ignore:next-line
        Module.ccall(
            "rivemu_start_ex",
            null,
            ["number", "number", "string"],
            [buf, cartridgeData.length, params]
        );
        // @ts-ignore:next-line
        Module._free(buf);
    }

    function rivemuStop() {
        setIsPlaying(false);
        console.log("rivemuStop");
        // @ts-ignore:next-line
        Module.cwrap("rivemu_stop")();
    }

    function rivemuDownloadGameplay() {
        const filename = "gameplay.rivlog";
        const blobFile = new Blob([rivlogData!], {
            type: "application/octet-stream",
        });
        const file = new File([blobFile], filename);
        const urlObj = URL.createObjectURL(file);
        console.log("Gameplay Downloaded!");
        download(urlObj, filename);
        rivlogData = rivlogData;
    }

    if (typeof window !== "undefined") {
        let decoder = new TextDecoder();
        // @ts-ignore:next-line
        window.rivemu_on_outcard_update = function (outcard: any) {
            let outcard_str = decoder.decode(outcard);
            let score = JSON.parse(outcard_str.substring(4)).score;
            setOverallScore(score);
        };

        // @ts-ignore:next-line
        window.rivemu_on_begin = function (width: any, height: any) {
            console.log("rivemu_on_begin");
            setIsLoading(false);
            // force canvas resize
            window.dispatchEvent(new Event("resize"));
        };

        // @ts-ignore:next-line
        window.rivemu_on_finish = function (
            rivlog: ArrayBuffer,
            outcard: ArrayBuffer
        ) {
            console.log("rivemu_on_finish");
            rivlogData = new Uint8Array(rivlog);
            setDownloadAvailable(true);
        };
    }

    const theme = useMantineTheme();
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const token = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address;

    const canJoin = !!rivlogData;

    return (
        <Center>
            <Stack align="center" mt={20}>
                <Title>{contest?.name}</Title>
                <canvas
                    id="canvas"
                    height={400}
                    width={640}
                    onContextMenu={(e) => e.preventDefault()}
                    tabIndex={1}
                />
                <Group justify="space-between" w="100%">
                    <Group>
                        <Button
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={rivemuStart}
                            loading={isLoading}
                            leftSection={
                                isPlaying ? (
                                    <TbPlayerSkipBackFilled />
                                ) : (
                                    <TbPlayerPlayFilled />
                                )
                            }
                        >
                            {isPlaying ? "Restart" : "Start"}
                        </Button>
                        <Button
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={rivemuStop}
                            leftSection={<TbPlayerStopFilled />}
                            disabled={!isPlaying}
                        >
                            Stop
                        </Button>
                    </Group>
                    <Group>
                        <Text>Score</Text>
                        <Badge
                            variant="filled"
                            color={theme.primaryColor}
                            size="xl"
                        >
                            {overallScore}
                        </Badge>
                    </Group>
                    <Group>
                        <Button disabled={!canJoin} onClick={toggle}>
                            Join Contest!
                        </Button>
                        <Button
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={rivemuDownloadGameplay}
                            leftSection={<TbDownload />}
                            disabled={!isDownloadAvailable}
                        >
                            Download
                        </Button>
                    </Group>
                </Group>
                <Collapse in={join} w="100%">
                    {rivlogData && (
                        <JoinContest
                            contestId={1}
                            dapp={dapp}
                            token={token}
                            ticketPrice={10n * 10n ** 18n}
                            gamelog={rivlogData}
                        />
                    )}
                </Collapse>
            </Stack>
            <Script src="/rivemu.js" strategy="lazyOnload" />
        </Center>
    );
};

// play freely
// stop game
// join
// check balance
// approve allowance
// deposit + commit
// download

export default PlayContestGame;
