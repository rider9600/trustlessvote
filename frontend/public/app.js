(() => {
  const connectBtn = document.getElementById('connectBtn');
  const rpcConnectBtn = document.getElementById('rpcConnectBtn');
  const pkInput = document.getElementById('pkInput');
  const saveAddressBtn = document.getElementById('saveAddress');
  const contractAddressInput = document.getElementById('contractAddress');

  const accountEl = document.getElementById('account');
  const adminEl = document.getElementById('admin');
  const phaseEl = document.getElementById('phase');
  const statusEl = document.getElementById('status');

  const addVoterBtn = document.getElementById('addVoter');
  const voterAddressInput = document.getElementById('voterAddress');
  const nextPhaseBtn = document.getElementById('nextPhase');

  const commitChoiceInput = document.getElementById('commitChoice');
  const commitSecretInput = document.getElementById('commitSecret');
  const commitBtn = document.getElementById('commitBtn');

  const revealChoiceInput = document.getElementById('revealChoice');
  const revealSecretInput = document.getElementById('revealSecret');
  const revealBtn = document.getElementById('revealBtn');

  const countEls = [
    document.getElementById('count0'),
    document.getElementById('count1'),
    document.getElementById('count2'),
    document.getElementById('count3'),
  ];

  const PHASES = ['Register', 'Commit', 'Reveal', 'End'];

  // Minimal ABI for TrustlessVote
  const ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "admin", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "currentPhase", "outputs": [{"internalType":"enum TrustlessVote.Phase","name":"","type":"uint8"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "eligibleVoters", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "commitments", "outputs": [{"internalType":"bytes32","name":"","type":"bytes32"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"","type":"uint256"}], "name": "voteCount", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
    { "inputs": [{"internalType":"address","name":"voter","type":"address"}], "name": "addVoter", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "nextPhase", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"bytes32","name":"commitment","type":"bytes32"}], "name": "commitVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{"internalType":"uint256","name":"choice","type":"uint256"},{"internalType":"string","name":"secret","type":"string"}], "name": "revealVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
  ];

  let provider, signer, contract, account;

  function setStatus(msg, isError=false) {
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? '#f85149' : '#8b949e';
  }

  function requireContract() {
    const addr = contractAddressInput.value.trim();
    if (!ethers.isAddress(addr)) {
      throw new Error('Enter a valid contract address');
    }
    return addr;
  }

  function saveAddress(addr) {
    localStorage.setItem('trustlessvote:address', addr);
  }

  function loadAddress() {
    const saved = localStorage.getItem('trustlessvote:address');
    if (saved) contractAddressInput.value = saved;
  }

  async function ensureConnection() {
    if (!window.ethereum) {
      throw new Error('MetaMask not found. You can use Local RPC (dev) below.');
    }
    if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || !accounts[0]) throw new Error('No account returned');
    account = ethers.getAddress(accounts[0]);
    signer = await provider.getSigner();
    accountEl.textContent = account;
  }

  async function connectViaRpc() {
    try {
      const pk = pkInput.value.trim();
      if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
        throw new Error('Enter a valid 0x-prefixed 64-hex private key');
      }
      const rpcUrl = 'http://localhost:8545';
      provider = new ethers.JsonRpcProvider(rpcUrl);
      signer = new ethers.Wallet(pk, provider);
      account = await signer.getAddress();
      accountEl.textContent = account;
      setStatus('Connected via RPC.');
      await loadContract();
    } catch (e) {
      setStatus(e.message || String(e), true);
    }
  }

  async function loadContract() {
    const addr = requireContract();
    saveAddress(addr);
    contract = new ethers.Contract(addr, ABI, signer);
    await refreshState();
  }

  async function refreshState() {
    if (!contract) return;
    try {
      const [admin, phase] = await Promise.all([
        contract.admin(),
        contract.currentPhase(),
      ]);
      adminEl.textContent = admin;
      const phaseIndex = Number(phase);
      phaseEl.textContent = PHASES[phaseIndex] ?? String(phaseIndex);

      // tallies for first 4 choices
      for (let i = 0; i < countEls.length; i++) {
        try {
          const count = await contract.voteCount(i);
          countEls[i].textContent = count.toString();
        } catch (_) {
          countEls[i].textContent = '0';
        }
      }
      setStatus('State refreshed.');
    } catch (e) {
      setStatus(e.message || String(e), true);
    }
  }

  async function addVoter() {
    try {
      const voter = voterAddressInput.value.trim();
      if (!ethers.isAddress(voter)) throw new Error('Invalid voter address');
      const tx = await contract.addVoter(voter);
      setStatus('addVoter tx sent: ' + tx.hash);
      await tx.wait();
      setStatus('Voter added.');
      await refreshState();
    } catch (e) { setStatus(e.message || String(e), true); }
  }

  async function nextPhase() {
    try {
      const tx = await contract.nextPhase();
      setStatus('nextPhase tx sent: ' + tx.hash);
      await tx.wait();
      setStatus('Phase advanced.');
      await refreshState();
    } catch (e) { setStatus(e.message || String(e), true); }
  }

  function buildCommit(choice, secret) {
    const enc = ethers.AbiCoder.defaultAbiCoder().encode(['uint256','string'], [choice, secret]);
    return ethers.keccak256(enc);
  }

  async function commitVote() {
    try {
      const choice = Number(commitChoiceInput.value);
      if (!Number.isInteger(choice) || choice < 0) throw new Error('Enter a valid integer choice');
      const secret = commitSecretInput.value;
      if (!secret) throw new Error('Enter a secret');
      const commitment = buildCommit(choice, secret);
      const tx = await contract.commitVote(commitment);
      setStatus('commitVote tx sent: ' + tx.hash);
      await tx.wait();
      setStatus('Vote committed.');
      await refreshState();
    } catch (e) { setStatus(e.message || String(e), true); }
  }

  async function revealVote() {
    try {
      const choice = Number(revealChoiceInput.value);
      if (!Number.isInteger(choice) || choice < 0) throw new Error('Enter a valid integer choice');
      const secret = revealSecretInput.value;
      if (!secret) throw new Error('Enter the same secret used to commit');
      const tx = await contract.revealVote(choice, secret);
      setStatus('revealVote tx sent: ' + tx.hash);
      await tx.wait();
      setStatus('Vote revealed.');
      await refreshState();
    } catch (e) { setStatus(e.message || String(e), true); }
  }

  // Event bindings
  connectBtn.addEventListener('click', async () => {
    try {
      await ensureConnection();
      await loadContract();
    } catch (e) { setStatus(e.message || String(e), true); }
  });

  saveAddressBtn.addEventListener('click', async () => {
    try {
      await ensureConnection();
      await loadContract();
    } catch (e) { setStatus(e.message || String(e), true); }
  });

  addVoterBtn.addEventListener('click', addVoter);
  nextPhaseBtn.addEventListener('click', nextPhase);
  commitBtn.addEventListener('click', commitVote);
  revealBtn.addEventListener('click', revealVote);
  rpcConnectBtn.addEventListener('click', connectViaRpc);

  // Init
  loadAddress();
  setStatus('Ready. Enter contract address and connect.');
})();
