import { Badge, DefaultMantineColor, Group, Text } from "@mantine/core";
import { FC } from "react";

export type InfoProps = {
    label: string;
    value: string;
    color?: DefaultMantineColor;
};

export const Info: FC<InfoProps> = ({ color, label, value }) => {
    return (
        <Badge color={color}>
            <Group gap={5}>
                <Text size="xs" style={{ textTransform: "none" }}>
                    {label}
                </Text>
                <Text fw={900} size="xs">
                    {value}
                </Text>
            </Group>
        </Badge>
    );
};
