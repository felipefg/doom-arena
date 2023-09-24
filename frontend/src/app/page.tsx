"use client";
import React, { FC } from "react";
import {
    Button,
    Center,
    Divider,
    Group,
    Skeleton,
    Stack,
    Title,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { useInspect } from "../hooks/inspect";
import { Contest } from "../model";
import { ContestCard } from "../components/ContestCard";
import { Leaderboard } from "../components/Leaderboard";

const Home: FC = () => {
    const {
        report: contest,
        isLoading,
        error,
        data,
    } = useInspect<Contest>(`/active_contest`);
    return (
        <Center>
            <Stack align="center" py={30}>
                {isLoading && <Skeleton />}
                {!contest?.contest_id && !isLoading && (
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
                {contest?.contest_id && (
                    <>
                        <ContestCard contest={contest} />
                        <Group>
                            <Link href={`/play/${contest.contest_id}`}>
                                <Button size="lg">Play Now</Button>
                            </Link>
                        </Group>
                        <Divider />
                        <Title order={4}>Leaderboard</Title>
                        <Leaderboard
                            contestId={contest.contest_id}
                            players={contest.players ?? []}
                        />
                    </>
                )}
            </Stack>
        </Center>
    );
};

export default Home;
