import { FC } from "react";
import { Table } from "@mantine/core";
import { Player } from "../model";

export type LeaderboardProps = {
    players: Player[];
};

export const Leaderboard: FC<LeaderboardProps> = ({ players }) => {
    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Address</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>Reward</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {players.map((player) => (
                    <Table.Tr key={player.wallet}>
                        <Table.Td>{player.wallet}</Table.Td>
                        <Table.Td>{player.score}</Table.Td>
                        <Table.Td>{player.reward}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};
