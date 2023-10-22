// index.html
const loginUsername = document.getElementById('login-username');
const loginPw = document.getElementById('login-password');
const btnLogin = document.querySelector('.login-button');

// accounts
const account1 = {
  owner: 'Sergio Tales',
  username: 'st',
  pin: 1111,
  movements: [200, -23, 840, -300, 1000, 540, -800],
};

const account2 = {
  owner: 'Nico Robin',
  username: 'nr',
  pin: 2222,
  movements: [350, -200, 1040, -500, -1000, 540, 800, -30],
};

let accounts = [account1, account2];
let currentAccount;

//function created to update local storage
function updateLocalStorage(curArr) {
  localStorage.setItem(curArr.username, JSON.stringify(curArr));
}

// this is the function that store all accounts into localStorage
function initializeLocalStorage() {
  // creating the test variables into local storage
  if (JSON.parse(localStorage.getItem('initialized'))) {
    // if localStorage is already settled we just update the accounts array doesn't changing the localStorage
    setAccountsArray(true);
  } else {
    localStorage.setItem('initialized', true);
    accounts.forEach((element, index) => {
      element.balance = element.movements.reduce((acc, cur) => acc + cur);
      element.active = false;
      element.index = index;
      element.requestedMoves = [];
      localStorage.setItem(element.username, JSON.stringify(element));
    });
  }
}
// the login function only needs to redirect the user into the app page
function login() {
  initializeLocalStorage();
  // saving the current account that we are into
  currentAccount = accounts.find(
    acc => acc.username === loginUsername.value && acc.pin === Number(loginPw.value)
  );
  currentAccount.active = true;
  updateLocalStorage(currentAccount);

  // block to check if currentAccount is true (values corresponding)
  if (currentAccount) {
    window.location.href = 'app.html';
  } else {
    // block in case of password or username inexistent
  }
}

// app.html
// balance / movements
const labelBalance = document.querySelector('.label-balance');
const movementsContainer = document.querySelector('.movements');

// transfer
const transferToInput = document.getElementById('transfer-to-input');
const transferAmount = document.getElementById('transfer-amount-input');
const btnTransfer = document.querySelector('.transfer-btn');

// request
const requestToInput = document.getElementById('request-to-input');
const requestAmount = document.getElementById('request-amount-input');
const btnRequest = document.querySelector('.request-btn');

// close acc
const closeUsername = document.getElementById('close-username-input');
const closePin = document.getElementById('close-pin-input');
const btnClose = document.querySelector('.close-btn');

let movements;
let balance;
function displayUI() {
  // this function will start when app.html load
  // searching for the account with active true
  console.log(accounts);
  setAccountsArray(false);
  console.log(accounts);
  accounts.forEach(acc => {
    if (acc.active === true) {
      // storing that account into movements
      movements = acc.movements;
      currentAccount = acc;
    }
  });

  // using the active acc to display the ui
  labelBalance.innerHTML = currentAccount.balance;
  // looping through acc.movements and displaying the movements.
  movementsContainer.innerHTML = '';
  movements.forEach((element, index) => {
    let type = element > 0 ? 'deposit' : 'withdrawal';
    let html = `
        <div class="movement-index">${index + ' ' + type.toUpperCase()}</div>
        <div class="movement-value">${element}$</div>
  `;

    movementsContainer.insertAdjacentHTML('afterbegin', html);
  });

  // TRANSFER
  btnTransfer.addEventListener('click', () => {
    const receiverAcc = retrieveAcc(transferToInput.value);
    const amount = Number(transferAmount.value);
    if (
      amount <= currentAccount.balance &&
      receiverAcc &&
      receiverAcc.username !== currentAccount.username
    ) {
      // updating movements array with the new transfer
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      transferAmount.value = transferToInput.value = '';
      // updating balance with new values
      setBalance(currentAccount);

      // updating localStorage
      updateLocalStorage(receiverAcc);
      updateLocalStorage(currentAccount);
      // localStorage.setItem(receiverAcc.username, JSON.stringify(receiverAcc));
      // localStorage.setItem(currentAccount.username, JSON.stringify(currentAccount));
      displayUI();
    }
  });

  // REQUEST
  btnRequest.addEventListener('click', () => {
    const requestedAcc = retrieveAcc(requestToInput.value);
    const amount = +requestAmount.value;
    if (
      requestedAcc !== currentAccount.username &&
      requestedAcc.balance >= amount &&
      amount > 0 &&
      requestedAcc
    ) {
      requestedAcc.requestedMoves.push(amount);
      updateLocalStorage(requestedAcc);
      requestToInput.value = requestAmount.value = '';
    }
  });

  // CLOSE ACCOUNT
  btnClose.addEventListener('click', () => {
    const closeAcc = retrieveAcc(closeUsername.value);
    if (
      closeAcc &&
      closeAcc.username === currentAccount.username &&
      closeAcc.pin === +closePin.value
    ) {
      // we remove the specified index from accounts array
      accounts.splice(currentAccount.index, 1);
      localStorage.removeItem(currentAccount.username);
      document.querySelector('.closeAcc-modal').classList.toggle('hidden');
    }
  });
}

function setBalance(acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur);
}

function clearStorage() {
  localStorage.clear();
}

function retrieveAcc(username) {
  return JSON.parse(localStorage.getItem(username));
}

function logout() {
  // this is not working properly
  for (let i = 0; i < accounts.length; i++) {
    accounts[i] = JSON.parse(localStorage.getItem(accounts[i].username));
  }
  window.location.href = 'index.html';
}

function setAccountsArray(activeAllFalse) {
  accounts = [];
  let counter = 0;
  Object.keys(localStorage).forEach(key => {
    if (key === 'initialized') {
      counter = counter;
    } else {
      accounts[counter] = JSON.parse(localStorage.getItem(key));
      accounts[counter].balance = accounts[counter].movements.reduce((acc, cur) => acc + cur);
      if (activeAllFalse) {
        accounts[counter].active = false;
      } else {
        accounts[counter].active === true ? null : (accounts[counter].active = false);
      }
      accounts[counter].requestedMoves = [];

      localStorage.setItem(accounts[counter].username, JSON.stringify(accounts[counter]));
      counter++;
    }
  });
}
