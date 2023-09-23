"use client";

import { Button, Center, Stack } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export function Page() {
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
            </Stack>
        </Center>
    );
}

export default Page;
