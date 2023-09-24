import { FC } from "react";
import { ActionIcon, Group, Table, Tooltip } from "@mantine/core";
import { Player } from "../model";
import Link from "next/link";
import { TbPlayerPlayFilled, TbUpload } from "react-icons/tb";
import { useAccount } from "wagmi";

export type LeaderboardProps = {
    contestId: number;
    players: Player[];
};

export const Leaderboard: FC<LeaderboardProps> = ({ contestId, players }) => {
    const { address } = useAccount();
    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Address</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>Reward</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {players.map((player) => (
                    <Table.Tr key={player.wallet}>
                        <Table.Td>{player.wallet}</Table.Td>
                        <Table.Td>{player.score}</Table.Td>
                        <Table.Td>{player.reward}</Table.Td>
                        <Table.Td>
                            <Group gap={5}>
                                {player.score && (
                                    <Link
                                        href={`/replay/${contestId}/${player.wallet}`}
                                    >
                                        <Tooltip label="Replay">
                                            <ActionIcon>
                                                <TbPlayerPlayFilled />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Link>
                                )}
                                {player.wallet.toLowerCase() ===
                                    address?.toLowerCase() && (
                                    <Link href={`/submit/${contestId}`}>
                                        <Tooltip label="Submit">
                                            <ActionIcon>
                                                <TbUpload />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Link>
                                )}
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};
