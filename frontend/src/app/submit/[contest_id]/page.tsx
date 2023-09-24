"use client";
import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { FC, useState } from "react";
import { TbExclamationCircle, TbUpload } from "react-icons/tb";
import { Address, bytesToHex, Hex, toHex } from "viem";
import { useWaitForTransaction } from "wagmi";

import { useInspect } from "../../../hooks/inspect";
import { Contest } from "../../../model";
import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "../../../hooks/contracts";
import { ContestCard } from "../../../components/ContestCard";

type PlayContextGameParams = {
    params: { contest_id: string };
};

const PlayContestGame: FC<PlayContextGameParams> = ({
    params: { contest_id },
}) => {
    const { report: contest, error } = useInspect<Contest>(
        `/contest/${contest_id}`
    );

    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;

    // game log file, user must upload
    const [gameplay, setGameplay] = useState<Hex>();

    // build payload
    const payload = { action: "submit_contest", contest_id, gameplay };

    // prepare InputBox transaction
    const { config } = usePrepareInputBoxAddInput({
        args: [dapp, toHex(JSON.stringify(payload))],
    });
    const { data, write } = useInputBoxAddInput(config);
    const wait = useWaitForTransaction(data);

    const readFile = (f: FileWithPath) => {
        f.arrayBuffer().then((buf) => {
            setGameplay(bytesToHex(new Uint8Array(buf)));
        });
    };

    return (
        <Center>
            <Stack align="center" mt={30}>
                {contest?.contest_id && <ContestCard contest={contest} />}
                <Group justify="space-between" w="100%">
                    <Dropzone
                        onDrop={(files) => readFile(files[0])}
                        onReject={(files) =>
                            console.log("rejected files", files)
                        }
                        maxSize={3 * 1024 ** 2}
                    >
                        <Group
                            justify="center"
                            gap="xl"
                            mih={220}
                            style={{ pointerEvents: "none" }}
                        >
                            <Dropzone.Accept>
                                <TbUpload size={60} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <TbExclamationCircle size={60} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <TbUpload size={60} />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag game log files here or click to select
                                    file
                                </Text>
                                <Text size="sm" c="dimmed" inline mt={7}>
                                    Attach a single .rivlog of the gameplay
                                    previously downloaded and committed during
                                    the signup
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                </Group>
                <Button disabled={!write || !gameplay} onClick={write}>
                    Submit
                </Button>
            </Stack>
        </Center>
    );
};

export default PlayContestGame;
