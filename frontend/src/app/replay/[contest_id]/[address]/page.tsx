"use client";
import Script from "next/script";
import {
    Center,
    Group,
    Stack,
    Text,
    Loader,
    Progress,
    ActionIcon,
    Badge,
} from "@mantine/core";
import { FC, useState } from "react";
import { useInspect, useRawInspect } from "../../../../hooks/inspect";
import { Contest } from "../../../../model";
import { TbPlayerPlayFilled } from "react-icons/tb";

let cartridgeData: Uint8Array | undefined = undefined;
let replayFrames: number = 1;

type ReplayContextGameParams = {
    params: { contest_id: string; address: string };
};

const ReplayContestGame: FC<ReplayContextGameParams> = ({
    params: { contest_id, address },
}) => {
    const [progress, setProgress] = useState(0);
    const [overallScore, setOverallScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { report: contest } = useInspect<Contest>(`/contest/${contest_id}`);
    const { report: gameplay } = useRawInspect(
        `/gameplay/${contest_id}/${address}`
    );

    async function get_cartridge() {
        let res = await fetch("/doom.sqfs");
        return new Uint8Array(await res.arrayBuffer());
    }

    async function rivemuStartReplay() {
        console.log("rivemuStartReplay");
        setIsLoading(true);
        setProgress(0);
        replayFrames = 0;
        // @ts-ignore:next-line
        if (Module.quited) {
            // restart wasm when back to page
            // @ts-ignore:next-line
            Module._main();
        }
        if (!cartridgeData) {
            // @ts-ignore:next-line
            cartridgeData = await get_cartridge();
        } else {
            // wait spinner animation to show up
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        // @ts-ignore:next-line
        let cartridgeBuf = Module._malloc(cartridgeData.length);
        // @ts-ignore:next-line
        let rivlogBuf = Module._malloc(gameplay.length);
        // @ts-ignore:next-line
        Module.HEAPU8.set(cartridgeData, cartridgeBuf);
        // @ts-ignore:next-line
        Module.HEAPU8.set(gameplay, rivlogBuf);
        let difficulty = contest?.difficulty;
        let level = contest?.level;
        let params = `-iwad doom1.wad -skill ${difficulty} -warp 1 ${level} -levelquit ${level} -deathquit -nowipe -nomenu`;
        // @ts-ignore:next-line
        Module.ccall(
            "rivemu_start_replay_ex",
            null,
            ["number", "number", "number", "number", "string"],
            [
                cartridgeBuf,
                cartridgeData.length,
                rivlogBuf,
                gameplay?.length,
                params,
            ]
        );
        // @ts-ignore:next-line
        Module._free(cartridgeBuf);
        // @ts-ignore:next-line
        Module._free(rivlogBuf);
    }

    if (typeof window !== "undefined") {
        let decoder = new TextDecoder();
        // @ts-ignore:next-line
        window.rivemu_on_outcard_update = function (outcard: any) {
            let outcard_str = decoder.decode(outcard);
            let scores = JSON.parse(outcard_str.substring(4));
            if (replayFrames > 0) {
                let percent = Math.min(
                    Math.round(
                        (Math.max(scores.frames - 3, 0) * 10000) / replayFrames
                    ) / 100,
                    100
                );
                setProgress(percent);
            }
            setOverallScore(scores.score);
        };

        // @ts-ignore:next-line
        window.rivemu_on_begin = function (
            width: any,
            height: any,
            frames: any
        ) {
            console.log("rivemu_on_begin");
            replayFrames = frames;
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
        };
    }
    return (
        <Center>
            <Stack align="center" mt={20}>
                <Stack gap={0}>
                    <canvas
                        id="canvas"
                        height={400}
                        width={640}
                        onContextMenu={(e) => e.preventDefault()}
                        tabIndex={1}
                    />
                    <Progress value={progress} size="sm" w="100%" />
                </Stack>
                <Group justify="space-between" w="100%">
                    <Group>
                        <ActionIcon
                            onKeyDown={(e) => e.preventDefault()}
                            onClick={rivemuStartReplay}
                        >
                            <TbPlayerPlayFilled />
                        </ActionIcon>
                        {isLoading && <Loader size="sm" />}
                    </Group>
                    <Group>
                        <Text>Score</Text>
                        <Badge size="lg">{overallScore}</Badge>
                    </Group>
                </Group>
            </Stack>
            <Script src="/rivemu.js" strategy="lazyOnload" />
        </Center>
    );
};

export default ReplayContestGame;
