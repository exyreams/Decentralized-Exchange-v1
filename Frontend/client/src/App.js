import React from "react";
import Footer from './Footer.js';
import { Web3Button } from "@web3modal/react";

function App() {
    return (
        <div id="app">
            <div>
                Header
            </div>
            <div>
                Main part
            </div>
            <div>
                <h4>Connect Wallet</h4>
                <Web3Button />
            </div>
            <Footer />
        </div>
    );
}

export default App;