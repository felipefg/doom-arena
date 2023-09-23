"use client";
import { useMantineColorScheme } from "@mantine/core";
import {
    AvatarComponent,
    RainbowKitProvider,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import "@rainbow-me/rainbowkit/styles.css";
import {
    argentWallet,
    ledgerWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Image from "next/image";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const chain =
    [foundry, mainnet, sepolia].find((c) => c.id == chainId) || foundry;

// only 1 chain is enabled, based on env var
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [chain],
    [publicProvider()]
);

const projectId = "bd3725877ae8cde37b7c439efe33857d";
const { wallets } = getDefaultWallets({
    appName: "Doom NYC",
    projectId,
    chains,
});

const appInfo = {
    appName: "Doom NYC",
    learnMoreUrl: "https://doom.surge.sh",
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: "Other",
        wallets: [
            argentWallet({ chains, projectId }),
            trustWallet({ chains, projectId }),
            ledgerWallet({ chains, projectId }),
        ],
    },
]);

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
        <Image
            src={ensImage}
            width={size}
            height={size}
            style={{ borderRadius: 999 }}
            alt={address}
        />
    ) : (
        <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
    );
};

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const scheme = useMantineColorScheme();

    const walletTheme =
        scheme.colorScheme == "dark" ? darkTheme() : lightTheme();

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
                appInfo={appInfo}
                chains={chains}
                theme={walletTheme}
                avatar={CustomAvatar}
            >
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default WalletProvider;
