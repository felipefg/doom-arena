"use client";
import React, { FC } from "react";
import {
    Button,
    Center,
    Group,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { useInspect } from "../hooks/inspect";
import { Contest } from "../model";
import { DifficultyLevel } from "../components/DifficultyLevel";
import { formatUnits, Hex, hexToBigInt } from "viem";
import { EndContestButton } from "../components/EndContestButton";

const Home: FC = () => {
    const {
        report: contest,
        error,
        data,
    } = useInspect<Contest>(`/active_contest`);
    console.log(contest);
    return (
        <Center>
            <Stack align="center">
                <Textarea value={error} />
                <Textarea value={JSON.stringify(data)} />
                {!contest && (
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
                {contest && (
                    <>
                        <Title>{contest.name}</Title>
                        <Text>Hosted by {contest.host}</Text>
                        <DifficultyLevel value={contest.difficulty - 1} />
                        <Group>
                            <EndContestButton
                                buttonProps={{ size: "lg" }}
                                contestId={contest.contest_id}
                            />
                            <Stack>
                                <Link href="/play">
                                    <Button size="lg">Play Now</Button>
                                </Link>
                            </Stack>
                        </Group>
                    </>
                )}
            </Stack>
        </Center>
    );
};

export default Home;
