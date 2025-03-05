document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connect-wallet');
    const accountDisplay = document.getElementById('account-display');

    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };

    // Connect wallet function
    async function connectWallet() {
        if (!isMetaMaskInstalled()) {
            alert('Please install MetaMask to use this feature!');
            window.open('https://metamask.io/download.html', '_blank');
            return;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            // Display the connected account
            const account = accounts[0];
            const shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
            
            accountDisplay.textContent = shortenedAccount;
            connectButton.textContent = 'Connected';
            connectButton.disabled = true;

            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
                if (newAccounts.length === 0) {
                    // Disconnected
                    accountDisplay.textContent = '';
                    connectButton.textContent = 'Connect Wallet';
                    connectButton.disabled = false;
                } else {
                    // Account changed
                    const newAccount = newAccounts[0];
                    const shortenedNewAccount = `${newAccount.substring(0, 6)}...${newAccount.substring(newAccount.length - 4)}`;
                    accountDisplay.textContent = shortenedNewAccount;
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

        } catch (error) {
            console.error(error);
            alert('Failed to connect wallet. Please try again.');
        }
    }

    // Add click event to connect button
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
});