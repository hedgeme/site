document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connect-wallet');
    const accountDisplay = document.getElementById('account-display');
    const networkDisplay = document.createElement('span');
    networkDisplay.id = 'network-display';
    networkDisplay.style.marginLeft = '10px';
    networkDisplay.style.fontSize = '0.8em';
    networkDisplay.style.padding = '3px 8px';
    networkDisplay.style.borderRadius = '4px';
    networkDisplay.style.display = 'inline-block';
    
    // Insert network display after account display
    if (accountDisplay && accountDisplay.parentNode) {
        accountDisplay.parentNode.insertBefore(networkDisplay, accountDisplay.nextSibling);
    }
    
    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };
    
    // Helper to identify networks by chain ID
    const getNetworkName = (chainId) => {
        const networks = {
            '0x1': 'Ethereum',
            '0x5': 'Goerli',
            '0x89': 'Polygon',
            '0x13881': 'Mumbai',
            '0xa': 'Optimism',
            '0xa4b1': 'Arbitrum',
            '0x38': 'BSC',
            '0xfa': 'Fantom',
            '0x63564c40': 'Harmony',  // Harmony Mainnet
            '0x6357d2e0': 'Harmony Testnet'
        };
        
        return networks[chainId] || `Chain ID: ${chainId}`;
    };
    
    // Set network display
    const updateNetworkDisplay = async () => {
        if (isMetaMaskInstalled()) {
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                const networkName = getNetworkName(chainId);
                
                // Set background color based on network
                let bgColor = '#6b7280'; // Default gray
                
                if (chainId === '0x1') bgColor = '#3b82f6'; // Ethereum blue
                if (chainId === '0x89') bgColor = '#8247e5'; // Polygon purple
                if (chainId === '0x38') bgColor = '#f3ba2f'; // BSC yellow
                if (chainId.includes('0x6356')) bgColor = '#00aee9'; // Harmony blue
                
                networkDisplay.textContent = networkName;
                networkDisplay.style.backgroundColor = bgColor;
                networkDisplay.style.color = bgColor === '#f3ba2f' ? '#000' : '#fff';
                
                // Display network only if connected
                networkDisplay.style.display = accountDisplay.textContent ? 'inline-block' : 'none';
            } catch (error) {
                console.error("Error getting network:", error);
                networkDisplay.textContent = 'Unknown Network';
                networkDisplay.style.backgroundColor = '#ef4444';
            }
        }
    };
    
    // Function to display account
    const displayAccount = (account) => {
        const shortenedAccount = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
        accountDisplay.textContent = shortenedAccount;
        connectButton.textContent = 'Connected';
        connectButton.disabled = true;
        updateNetworkDisplay();
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
                } else {
                    networkDisplay.style.display = 'none';
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
                    networkDisplay.style.display = 'none';
                } else {
                    // Account changed
                    displayAccount(newAccounts[0]);
                }
            });
            
            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
                updateNetworkDisplay();
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