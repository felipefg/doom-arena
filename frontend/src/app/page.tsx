"use client";
import React, { FC } from "react";
import {
    Button,
    Center,
    Group,
    Loader,
    Skeleton,
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
import { EndContestButton } from "../components/EndContestButton";
import { ContestCard } from "../components/ContestCard";
import { Leaderboard } from "../components/Leaderboard";

const Home: FC = () => {
    const {
        report: contest,
        isLoading,
        error,
        data,
    } = useInspect<Contest>(`/active_contest`);
    console.log(contest);
    return (
        <Center>
            <Stack align="center">
                {isLoading && <Skeleton />}
                {!contest && !isLoading && (
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
                        <ContestCard contest={contest} />
                        <Group>
                            <EndContestButton
                                buttonProps={{ size: "lg" }}
                                contestId={contest.contest_id}
                            />
                            <Link href={`/play/${contest.contest_id}`}>
                                <Button size="lg">Play Now</Button>
                            </Link>
                        </Group>
                        <Title order={4}>Leaderboard</Title>
                        <Leaderboard
                            contestId={contest.contest_id}
                            players={contest.players}
                        />
                    </>
                )}
            </Stack>
        </Center>
    );
};

export default Home;
