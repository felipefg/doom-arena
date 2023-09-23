import { Image, Radio, Stack, Tabs, Text, Title } from "@mantine/core";
import { FC, useState } from "react";

export const episodes = [
    {
        name: "Knee-Deep in the Dead",
        image: "/img/episode1.png",
        disabled: false,
        levels: [
            "Hangar",
            "Nuclear Plant",
            "Toxin Refinery",
            "Command Control",
            "Phobos Lab",
            "Central Processing",
            "Computer Station",
            "Phobos Anomaly",
            "Military Base",
        ],
    },
    {
        name: "The Shores of Hell",
        image: "/img/episode2.png",
        disabled: true,
        levels: [
            "Deimos Anomaly",
            "Containment Area",
            "Refinery",
            "Deimos Lab",
            "Command Center",
            "Halls of the Damned",
            "Spawning Vats",
            "Tower of Babel",
            "Fortress of Mystery",
        ],
    },
    {
        name: "Inferno",
        image: "/img/episode3.png",
        disabled: true,
        levels: [
            "Hell Keep",
            "Slough of Despair",
            "Pandemonium",
            "House of Pain",
            "Unholy Cathedral",
            "Mount Erebus",
            "Limbo",
            "Dis",
            "Warrens",
        ],
    },
];

export type GameLevelProps = {
    onChange(value: number): void;
};

export const GameLevel: FC<GameLevelProps> = ({ onChange }) => {
    const [episodeNumber, setEpisodeNumber] = useState(0);
    return (
        <Tabs
            pt={30}
            orientation="vertical"
            defaultValue={episodeNumber.toString()}
            onChange={(v) => v && setEpisodeNumber(parseInt(v))}
        >
            <Tabs.List>
                {episodes.map((episode, index) => (
                    <Tabs.Tab
                        key={index.toString()}
                        value={index.toString()}
                        disabled={episode.disabled}
                        leftSection={
                            <Image
                                alt={episode.name}
                                width={120}
                                height={90}
                                src={episode.image}
                            />
                        }
                    >
                        <Stack gap={0}>
                            <Title order={4}>{`Episode ${index + 1}`}</Title>
                            <Text>{episode.name}</Text>
                        </Stack>
                    </Tabs.Tab>
                ))}
            </Tabs.List>

            {episodes.map((episode, index) => (
                <Tabs.Panel
                    key={index.toString()}
                    value={index.toString()}
                    px={10}
                >
                    <Radio.Group
                        name={episode.name}
                        label="Level"
                        defaultValue="0"
                        onChange={
                            (v) => onChange(9 * episodeNumber + parseInt(v)) // XXX: each episode has 9 levels
                        }
                        description="Select level of episode"
                        withAsterisk
                    >
                        <Stack mt={10} gap={10} justify="space-between">
                            {episode.levels.map((level, index) => (
                                <Radio
                                    value={index.toString()}
                                    key={level}
                                    label={level}
                                />
                            ))}
                        </Stack>
                    </Radio.Group>
                </Tabs.Panel>
            ))}
        </Tabs>
    );
};
