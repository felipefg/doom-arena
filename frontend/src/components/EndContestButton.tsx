import { Button, ButtonProps } from "@mantine/core";
import { FC } from "react";
import { Address, toHex } from "viem";
import { useWaitForTransaction } from "wagmi";

import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "../hooks/contracts";

export type EndContestButtonProps = {
    buttonProps: ButtonProps;
    contestId: number;
};

export const EndContestButton: FC<EndContestButtonProps> = ({
    buttonProps,
    contestId,
}) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const payload = {
        action: "end_contest",
        contest_id: contestId,
    };

    // prepare InputBox transaction
    const { config } = usePrepareInputBoxAddInput({
        args: [dapp, toHex(JSON.stringify(payload))],
    });
    const { data, write } = useInputBoxAddInput(config);
    const wait = useWaitForTransaction(data);

    return (
        <Button {...buttonProps} onClick={write} disabled={!write}>
            End Contest
        </Button>
    );
};
