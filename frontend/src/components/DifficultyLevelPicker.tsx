import { SegmentedControl, Stack, Text } from "@mantine/core";
import Image from "next/image";
import { FC } from "react";

export const difficultyLevels = [
    { label: "I'm Too Young to Die", image: "/img/difficulty1.png" },
    { label: "Hey Not Too Rough", image: "/img/difficulty2.png" },
    { label: "Hurt Me Plenty", image: "/img/difficulty3.png" },
    { label: "Ultra Violence", image: "/img/difficulty4.png" },
    { label: "Nightmare", image: "/img/difficulty5.png" },
];

export type DifficultyLevelPickerProps = {
    onChange(value: number): void;
    value: number;
};

export const DifficultyLevelPicker: FC<DifficultyLevelPickerProps> = ({
    onChange,
    value,
}) => {
    return (
        <SegmentedControl
            onChange={(value) => onChange(parseInt(value))}
            value={value.toString()}
            data={difficultyLevels.map((level, index) => ({
                value: index.toString(),
                label: (
                    <Stack>
                        <Text size="xs">{level.label}</Text>
                        <Image
                            height={133}
                            width={100}
                            src={level.image}
                            alt={level.label}
                        />
                    </Stack>
                ),
            }))}
        />
    );
};
