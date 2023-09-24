import { FC } from "react";
import { ActionIcon, Table } from "@mantine/core";
import { Player } from "../model";
import Link from "next/link";
import { TbPlayerPlayFilled } from "react-icons/tb";

export type LeaderboardProps = {
    contestId: number;
    players: Player[];
};

export const Leaderboard: FC<LeaderboardProps> = ({ contestId, players }) => {
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
                            {player.score && (
                                <Link
                                    href={`/replay/${contestId}/${player.wallet}`}
                                >
                                    <ActionIcon>
                                        <TbPlayerPlayFilled />
                                    </ActionIcon>
                                </Link>
                            )}
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};
