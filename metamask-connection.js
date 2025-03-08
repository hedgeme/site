document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connect-wallet');
    const accountDisplay = document.getElementById('account-display');
    
    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };
    
    // Function to display account
    const displayAccount = (account) => {
        const shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
        accountDisplay.textContent = shortenedAccount;
        connectButton.textContent = 'Connected';
        connectButton.disabled = true;
    };
    
    // Try to reconnect if previously connected
    const checkConnection = async () => {
        if (isMetaMaskInstalled()) {
            try {
                // This will return connected accounts without prompting if permission was given
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    displayAccount(accounts[0]);
                    return true;
                }
            } catch (error) {
                console.error("Error checking connection:", error);
            }
        }
        return false;
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
            
            if (accounts.length > 0) {
                displayAccount(accounts[0]);
            }
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
                if (newAccounts.length === 0) {
                    // Disconnected
                    accountDisplay.textContent = '';
                    connectButton.textContent = 'Connect Wallet';
                    connectButton.disabled = false;
                } else {
                    // Account changed
                    displayAccount(newAccounts[0]);
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
    
    // Check for existing connection when page loads
    await checkConnection();
    
    // Add click event to connect button
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
});