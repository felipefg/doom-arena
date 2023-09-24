import { Menu, MenuItemProps } from "@mantine/core";
import { FC } from "react";
import { Address, toHex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { TbTrophy } from "react-icons/tb";

import {
    useInputBoxAddInput,
    usePrepareInputBoxAddInput,
} from "../hooks/contracts";

export type FinalizeContestMenuItemProps = {
    menuItemProps?: MenuItemProps;
    contestId: number;
};

export const FinalizeContestMenuItem: FC<FinalizeContestMenuItemProps> = ({
    menuItemProps,
    contestId,
}) => {
    const dapp = process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address;
    const payload = {
        action: "finalize_contest",
        contest_id: contestId,
    };

    // prepare InputBox transaction
    const { config } = usePrepareInputBoxAddInput({
        args: [dapp, toHex(JSON.stringify(payload))],
    });
    const { data, write } = useInputBoxAddInput(config);
    const wait = useWaitForTransaction(data);

    return (
        <Menu.Item
            {...menuItemProps}
            leftSection={<TbTrophy />}
            onClick={write}
            disabled={!write}
        >
            Finalize Contest
        </Menu.Item>
    );
};
