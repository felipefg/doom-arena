import {
    Button,
    ButtonProps,
    Group,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { FC } from "react";
import { Address, formatUnits } from "viem";
import { useWaitForTransaction } from "wagmi";
import {
    erc20PortalAddress,
    useErc20Approve,
    usePrepareErc20Approve,
} from "../hooks/contracts";

export type ApproveButtonProps = {
    allowance: bigint | undefined;
    buttonProps?: ButtonProps;
    depositAmount: bigint | undefined;
    token: Address;
};

export const ApproveButton: FC<ApproveButtonProps> = ({
    allowance,
    buttonProps,
    depositAmount,
    token,
}) => {
    // prepare approve transaction
    const { config } = usePrepareErc20Approve({
        address: token,
        args: [erc20PortalAddress, depositAmount!],
        enabled: !!depositAmount,
    });

    // approve tx
    const { data, write } = useErc20Approve(config);
    const { isLoading } = useWaitForTransaction(data);

    const disabled =
        !write ||
        allowance == undefined ||
        !depositAmount ||
        allowance >= depositAmount;

    return (
        <Button
            {...buttonProps}
            disabled={disabled}
            onClick={write}
            loading={isLoading}
        >
            Set Allowance
        </Button>
    );
};
