import { Image, SegmentedControl, Stack, Text } from "@mantine/core";
import { FC } from "react";

export const difficultyLevels = [
    { label: "I'm Too Young to Die", image: "/img/difficulty1.png" },
    { label: "Hurt Me Plenty", image: "/img/difficulty2.png" },
    { label: "Ultra Violence", image: "/img/difficulty3.png" },
    { label: "Nightmare", image: "/img/difficulty4.png" },
];

export type DifficultyLevelProps = {
    onChange(value: number): void;
    value: number;
};

export const DifficultyLevel: FC<DifficultyLevelProps> = ({
    onChange,
    value,
}) => {
    return (
        <SegmentedControl
            pt={30}
            onChange={(value) => onChange(parseInt(value))}
            value={value.toString()}
            data={difficultyLevels.map((level, index) => ({
                value: index.toString(),
                label: (
                    <Stack>
                        <Text size="sm">{level.label}</Text>
                        <Image
                            height={171}
                            width={128}
                            src={level.image}
                            alt={level.label}
                            onMouseEnter={(event) => event.target}
                        />
                    </Stack>
                ),
            }))}
        />
    );
};
