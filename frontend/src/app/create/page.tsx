"use client";

import {
    Button,
    Center,
    Group,
    NumberInput,
    Radio,
    SegmentedControl,
    Stack,
    Tabs,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import Image from "next/image";
import { FC } from "react";

const MIN_PRIZE_POOL = 100;

const difficultyLevels = [
    {
        value: "easy",
        label: "I'm Too Young to Die",
        image: "/img/difficulty1.png",
    },
    { value: "normal", label: "Hurt Me Plenty", image: "/img/difficulty2.png" },
    { value: "hard", label: "Ultra Violence", image: "/img/difficulty3.png" },
    { value: "impossible", label: "Nightmare", image: "/img/difficulty4.png" },
];

const episodes = [
    {
        name: "Knee-Deep in the Dead",
        image: "/img/episode1.png",
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

const CreateGame: FC = () => {
    return (
        <Center>
            <form>
                <Stack w={600}>
                    <Image
                        src="/img/banner.jpg"
                        width={600}
                        height={204}
                        alt="banner"
                    />
                    <TextInput
                        withAsterisk
                        size="lg"
                        label="Name"
                        description="Name of the tournament, for promotional reasons only"
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Initial Prize Pool"
                        suffix=" APE"
                        description="Initial amount of money in the prize pool"
                        min={MIN_PRIZE_POOL}
                        max={MIN_PRIZE_POOL * 100}
                        value={MIN_PRIZE_POOL}
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Ticket Price"
                        suffix=" APE"
                        description="Amount a player must contribute to the prize pool to participate in a tournament"
                        min={1}
                        value={10}
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Play Time"
                        suffix=" minutes"
                        min={10} // 10 minutes
                        max={60 * 24 * 2} // 2 days
                        value={60} // 1 hour
                        description="Amount of time players will have to play the game"
                    />
                    <NumberInput
                        withAsterisk
                        size="lg"
                        label="Submission Time"
                        suffix=" minutes"
                        min={10} // 10 minutes
                        max={60 * 3} // 3 hours
                        value={60}
                        description="Amount of time players will have to submit their gameplay"
                    />
                    <SegmentedControl
                        pt={30}
                        data={difficultyLevels.map((level) => ({
                            value: level.value,
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
                    <Tabs pt={30} orientation="vertical" defaultValue="1">
                        <Tabs.List>
                            {episodes.map((episode, index) => (
                                <Tabs.Tab
                                    key={index.toString()}
                                    value={index.toString()}
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
                                        <Title order={4}>{`Episode ${
                                            index + 1
                                        }`}</Title>
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
                                    description="Select level of episode"
                                    withAsterisk
                                >
                                    <Stack
                                        mt={10}
                                        gap={10}
                                        justify="space-between"
                                    >
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
                    <Group justify="center" mt="md">
                        <Button size="lg" type="submit">
                            Create Game
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Center>
    );
};

export default CreateGame;
