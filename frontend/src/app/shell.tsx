"use client";
import { AppShell, Group } from "@mantine/core";
import { FC } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";

export const Shell: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppShell header={{ height: 80 }}>
            <AppShell.Header>
                <Group h="100%" px={20}>
                    <Link href="/">
                        <Image
                            src="/img/logo.ico"
                            alt="logo"
                            width={48}
                            height={48}
                        />
                    </Link>
                    <Group justify="flex-end" style={{ flex: 1 }}>
                        <ConnectButton />
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
