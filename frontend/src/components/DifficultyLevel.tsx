import { Overlay, SegmentedControl, Stack, Text } from "@mantine/core";
import Image from "next/image";
import { FC } from "react";

export const difficultyLevels = [
    { label: "I'm Too Young to Die", image: "/img/difficulty1.png" },
    { label: "Hey Not Too Rough", image: "/img/difficulty2.png" },
    { label: "Hurt Me Plenty", image: "/img/difficulty3.png" },
    { label: "Ultra Violence", image: "/img/difficulty4.png" },
    { label: "Nightmare", image: "/img/difficulty5.png" },
];

export type DifficultyLevelProps = {
    value: number;
};

export const DifficultyLevel: FC<DifficultyLevelProps> = ({ value }) => {
    return (
        <SegmentedControl
            pt={30}
            value={value.toString()}
            data={difficultyLevels.map((level, index) => ({
                value: index.toString(),
                label: (
                    <Stack>
                        <Text size="xs">{level.label}</Text>
                        {index != value && <Overlay backgroundOpacity={0.8} />}
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
