import { ConnectButton } from "@rainbow-me/rainbowkit";

export const ButtonComponents = () => {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <ConnectButton label="Connect Your Wallet"  accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
            }}/>
        </div>
    );
};
