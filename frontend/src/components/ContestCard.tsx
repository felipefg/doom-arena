import { ActionIcon, Card, Center, Group, Menu, Text } from "@mantine/core";
import { FC } from "react";
import { Contest } from "../model";
import { DifficultyLevel } from "./DifficultyLevel";
import { TbClockStop, TbDots, TbTrophy } from "react-icons/tb";
import { Hex, formatUnits, hexToBigInt } from "viem";
import { EndContestMenuItem } from "./EndContestMenuItem";
import { FinalizeContestMenuItem } from "./FinalizeContestMenuItem";

export type ContestCardProps = {
    contest: Contest;
};

export const ContestCard: FC<ContestCardProps> = ({ contest }) => {
    return (
        <Card withBorder shadow="sm" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Text fw={500}>{contest.name}</Text>
                    <Menu withinPortal position="bottom-end" shadow="sm">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <TbDots />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <EndContestMenuItem
                                contestId={contest.contest_id}
                            />
                            <FinalizeContestMenuItem
                                contestId={contest.contest_id}
                            />
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Card.Section>
            <Text mt="sm" c="dimmed" size="sm">
                This contest is hosted by {contest.host}.
            </Text>
            <Card.Section mt="sm">
                <Center>
                    <DifficultyLevel value={contest.difficulty - 1} />
                </Center>
            </Card.Section>
        </Card>
    );
};
