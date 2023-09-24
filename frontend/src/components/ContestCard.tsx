import {
    ActionIcon,
    Badge,
    Card,
    Center,
    DefaultMantineColor,
    Group,
    Menu,
    Text,
} from "@mantine/core";
import { FC } from "react";
import { Contest } from "../model";
import { DifficultyLevel } from "./DifficultyLevel";
import { TbDots } from "react-icons/tb";
import { Address, Hex, formatUnits, hexToBigInt } from "viem";
import { EndContestMenuItem } from "./EndContestMenuItem";
import { FinalizeContestMenuItem } from "./FinalizeContestMenuItem";
import { Info } from "./Info";
import { shortAddress } from "./Address";
import { episodes } from "./GameLevel";

export type ContestCardProps = {
    contest: Contest;
};

export const ContestCard: FC<ContestCardProps> = ({ contest }) => {
    const ticketPrice = formatUnits(
        hexToBigInt(contest.ticket_price as Hex),
        18
    );
    const prizePool = formatUnits(hexToBigInt(contest.prize_pool as Hex), 18);
    //const ticketPrice = "0";
    //const prizePool = "0";

    return (
        <Card withBorder shadow="sm" radius="sm">
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
            <Group my={20}>
                <Info
                    label="Prize Pool"
                    value={`${prizePool} APE`}
                    color="yellow"
                />
                <Info
                    label="Ticket Price"
                    value={`${ticketPrice} APE`}
                    color="teal"
                />
                <Info
                    label="Host"
                    value={shortAddress(contest.host as Address)!}
                    color="cyan"
                />
                <Info
                    label="Level"
                    value={episodes[0].levels[contest.level - 1]}
                    color="gray"
                />
            </Group>
            <Card.Section mt="sm">
                <Center>
                    <DifficultyLevel value={contest.difficulty - 1} />
                </Center>
            </Card.Section>
        </Card>
    );
};
