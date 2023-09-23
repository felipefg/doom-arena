"use client";

import React, { FC } from "react";
import { Button, Center, Stack } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

const Home: FC = () => {
    return (
        <Center>
            <Stack align="center">
                <Image
                    src="/img/logo.png"
                    width={960}
                    height={570}
                    alt="banner"
                />
                <Link href="/create">
                    <Button>Create Game</Button>
                </Link>
                <Link href="/play">
                    <Button>Play Game</Button>
                </Link>
            </Stack>
        </Center>
    );
};

export default Home;
