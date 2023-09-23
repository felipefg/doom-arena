"use client";

import {
    Box,
    Button,
    Center,
    Group,
    JsonInput,
    NumberInput,
    Stack,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { FC, useState } from "react";
import { Address, toHex } from "viem";
import { useAccount, useWaitForTransaction } from "wagmi";

import { ApproveButton } from "../../components/ApproveButton";
import {
    erc20PortalAddress,
    useErc20Allowance,
    useErc20PortalDepositErc20Tokens,
    usePrepareErc20PortalDepositErc20Tokens,
} from "../../hooks/contracts";
import { DifficultyLevelPicker } from "../../components/DifficultyLevelPicker";
import { GameLevel } from "../../components/GameLevel";

const parseIfNeeded = (setter: (v: number) => void) => {
    return (s: string | number) => {
        if (typeof s === "number") {
            setter(s);
        } else {
            setter(parseInt(s));
        }
    };
};

const CreateGame: FC = () => {
    const token = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address;
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const theme = useMantineTheme();

    // connected account
    const { address } = useAccount();

    // flag to show payload as debug help
    const debug = true;

    // contest name
    const [name, setName] = useState("");

    // game difficulty level
    const [difficulty, setDifficulty] = useState(1);

    // game level
    const [level, setLevel] = useState(0);

    // times
    const [playTime, setPlayTime] = useState(60); // minutes
    const [submissionTime, setSubmissionTime] = useState(60); // minutes

    // token amounts
    const [initialPool, setInitialPool] = useState(100);
    const [ticketPrice, setTicketPrice] = useState(10);

    // query allowance
    const { data: allowance } = useErc20Allowance({
        address: token,
        args: [address!, erc20PortalAddress],
        enabled: !!address,
    });

    // input payload (sent through ERC20-deposit)
    const payload = {
        action: "create_contest",
        name,
        ticket_price: toHex(BigInt(ticketPrice) * 10n ** 18n),
        level: level + 1, // 1-based
        difficulty: difficulty + 1, // 1-based
        play_time: playTime * 60, // convert to seconds
        submission_time: submissionTime * 60, // convert to seconds
    };
    const execLayerData = toHex(JSON.stringify(payload));

    // ERC-20 deposit tx
    const { config } = usePrepareErc20PortalDepositErc20Tokens({
        args: [
            token,
            dapp,
            isNaN(initialPool) ? 0n : BigInt(initialPool) * 10n ** 18n,
            execLayerData,
        ],
        enabled:
            !!allowance &&
            !isNaN(initialPool) &&
            BigInt(initialPool) * 10n ** 18n <= allowance,
    });
    const { data, write } = useErc20PortalDepositErc20Tokens(config);
    const wait = useWaitForTransaction(data);

    return (
        <Center
            style={{
                backgroundImage: 'url("/img/banner.jpg")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <Box p={20} mt={180} bg={theme.colors.dark[7]}>
                <Stack w={600}>
                    <TextInput
                        withAsterisk
                        size="lg"
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        description="Name of the tournament, for promotional reasons only"
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Initial Prize Pool"
                        suffix=" APE"
                        description="Initial amount of tokens in the prize pool"
                        min={100}
                        value={initialPool}
                        onChange={parseIfNeeded(setInitialPool)}
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Ticket Price"
                        suffix=" APE"
                        description="Amount a player must contribute to the prize pool to participate in a tournament"
                        min={10}
                        value={ticketPrice}
                        onChange={parseIfNeeded(setTicketPrice)}
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Play Time"
                        suffix=" minutes"
                        min={10} // 10 minutes
                        max={60 * 24 * 2} // 2 days
                        value={playTime} // 1 hour
                        onChange={parseIfNeeded(setPlayTime)}
                        description="Amount of time players will have to play the game"
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Submission Time"
                        suffix=" minutes"
                        min={10} // 10 minutes
                        max={60 * 3} // 3 hours
                        value={submissionTime}
                        onChange={parseIfNeeded(setSubmissionTime)}
                        description="Amount of time players will have to submit their gameplay"
                    />
                    <DifficultyLevelPicker
                        onChange={setDifficulty}
                        value={difficulty}
                    />
                    <GameLevel onChange={setLevel} />
                    {debug && (
                        <JsonInput
                            label="Debug"
                            description="Payload sent with the ERC-20 deposit as execLayerData"
                            value={JSON.stringify(payload, undefined, 2)}
                            autosize
                        />
                    )}
                    <Group justify="center" mt="md">
                        <ApproveButton
                            allowance={allowance}
                            buttonProps={{ size: "lg" }}
                            depositAmount={
                                isNaN(initialPool)
                                    ? 0n
                                    : BigInt(initialPool) * 10n ** 18n
                            }
                            token={token}
                        />
                        <Button
                            size="lg"
                            type="submit"
                            disabled={!write}
                            onClick={write}
                        >
                            Create Game
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Center>
    );
};

export default CreateGame;
