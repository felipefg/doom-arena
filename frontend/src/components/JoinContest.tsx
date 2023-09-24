import { FC } from "react";
import { Address, formatUnits, toHex } from "viem";
import { Badge, Button, Group, Text, useMantineTheme } from "@mantine/core";
import { useAccount, useWaitForTransaction } from "wagmi";
import { sha256 } from "js-sha256";

import { ApproveButton } from "./ApproveButton";
import {
    erc20PortalAddress,
    useErc20Allowance,
    useErc20PortalDepositErc20Tokens,
    usePrepareErc20PortalDepositErc20Tokens,
} from "../hooks/contracts";

export type JoinContestProps = {
    contestId: number;
    token: Address;
    dapp: Address;
    gamelog: Uint8Array;
    ticketPrice: bigint;
};

export const JoinContest: FC<JoinContestProps> = ({
    contestId,
    dapp,
    gamelog,
    ticketPrice,
    token,
}) => {
    const theme = useMantineTheme();
    const { address } = useAccount();
    const gameplay_hash = sha256(gamelog);

    // query allowance
    const { data: allowance } = useErc20Allowance({
        address: token,
        args: [address!, erc20PortalAddress],
        enabled: !!address,
        watch: true,
    });

    // input payload (sent through ERC20-deposit)
    const payload = {
        action: "join_contest",
        contest_id: contestId,
        gameplay_hash,
    };
    const execLayerData = toHex(JSON.stringify(payload));

    // deposit + join
    // ERC-20 deposit tx
    const { config } = usePrepareErc20PortalDepositErc20Tokens({
        args: [token, dapp, ticketPrice, execLayerData],
        enabled: !!allowance && ticketPrice <= allowance,
    });
    const { data, write } = useErc20PortalDepositErc20Tokens(config);
    const wait = useWaitForTransaction(data);

    return (
        <Group justify="space-between">
            <Group>
                <Text>Ticket Price</Text>
                <Badge color={theme.primaryColor} size="lg">
                    {formatUnits(ticketPrice, 18)} APE
                </Badge>
            </Group>
            <Group>
                <ApproveButton
                    allowance={allowance}
                    depositAmount={ticketPrice}
                    token={token}
                />
                <Button disabled={!write} onClick={write}>
                    Deposit and Commit
                </Button>
            </Group>
        </Group>
    );
};
