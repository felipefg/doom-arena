"use client";
import React, { FC } from "react";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { useInspect } from "../hooks/inspect";
import { Contest } from "../model";
import { DifficultyLevel } from "../components/DifficultyLevel";
import { formatUnits, Hex, hexToBigInt } from "viem";

const Home: FC = () => {
    const {
        report: contest,
        error,
        data,
    } = useInspect<Contest>(`/active_contest`);
    const c = {
        contest_id: 1,
        name: "Contest",
        host: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92261",
        ticket_price: "0x8ac7230489e80000",
        level: 1,
        difficulty: 3,
        play_time: 3600,
        submission_time: 3600,
        creation_timestamp: 1695505002,
        state: "finalized",
        players: [
            {
                wallet: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                score: 123,
                reward: null,
            },
            {
                wallet: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92267",
                score: null,
                reward: null,
            },
        ],
        prize_pool: "0x32d26d12e980b600000",
    };

    return (
        <Center>
            <Stack align="center">
                {!c && (
                    <>
                        <Image
                            src="/img/logo.png"
                            width={960}
                            height={570}
                            alt="banner"
                        />
                        <Link href="/create">
                            <Button size="lg">Create Contest</Button>
                        </Link>
                    </>
                )}
                <Title>{c.name}</Title>
                <Text>Hosted by {c.host}</Text>
                <DifficultyLevel value={c.difficulty} />
                <Text size="sm">
                    {formatUnits(hexToBigInt(c.ticket_price as Hex), 18)} APE to
                    signup
                </Text>
                <Link href="/play">
                    <Button size="lg">Play Now</Button>
                </Link>
            </Stack>
        </Center>
    );
};

export default Home;
