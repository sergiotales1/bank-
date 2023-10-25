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
  // check if the values are exist
  if (accounts.some(acc => acc.username === loginUsername.value && acc.pin === +loginPw.value)) {
    // saving the current account that we are into
    currentAccount = accounts.find(
      acc => acc.username === loginUsername.value && acc.pin === Number(loginPw.value)
    );
    currentAccount.active = true;
    updateLocalStorage(currentAccount);
    window.location.href = 'app.html';
  } else {
    // block in case of password or username inexistent
    globalModal('login');
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
  setAccountsArray(false);
  accounts.forEach(acc => {
    if (acc.active === true) {
      // storing that account into movements
      movements = acc.movements;
      currentAccount = acc;
    }
  });
  if (currentAccount.requestedMoves.length > 0) {
    globalModal('requests');
  }

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
    transfer();
  });

  // REQUEST
  btnRequest.addEventListener('click', () => {
    // test if exists the requested acc into the db
    if (accounts.some(acc => acc.username === requestToInput.value)) {
      console.log('a');
      const requestedAcc = retrieveAcc(requestToInput.value);
      const amount = +requestAmount.value;
      if (
        requestedAcc.username !== currentAccount.username &&
        requestedAcc.balance >= amount &&
        amount > 0 &&
        requestedAcc
      ) {
        // push to the array a object containing the name of requester and array of value
        requestedAcc.requestedMoves.push([currentAccount.username, amount]);
        updateLocalStorage(requestedAcc);
        requestToInput.value = requestAmount.value = '';
      } // we need a block to when some condition don't match
    } else {
      // shows the modal
      globalModal('app');
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
      globalModal('close');
      // document.querySelector('.closeAcc-modal').classList.toggle('hidden');
    }
  });
}

function setBalance(acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur);
}

function clearStorage() {
  localStorage.clear();
  window.location.reload();
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

function setAccountsArray(activeAllFalse = true) {
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

      localStorage.setItem(accounts[counter].username, JSON.stringify(accounts[counter]));
      counter++;
    }
  });
}

const globalModal = function (modal) {
  // LOGIN ERROR MODAL
  const errorLogin = document.querySelector('.error-modal-login');
  const overlay = document.querySelector('.overlay');
  const errorText = document.getElementById('login-error-text');
  if (modal === 'login') {
    // tests what is the reason of the error NEED TO WORK ON!!!
    // first error = when we don't find an correspondent account
    errorText.textContent = "Error: We couldn't find that match of account. Please check again!";
    // show the error modal
    errorLogin.classList.remove('hidden');
    overlay.classList.remove('hidden');
    const removeHidden = function () {
      // pick the overlay and made them disappear
      overlay.classList.add('hidden');
      errorLogin.classList.add('hidden');
      loginUsername.value = loginPw.value = '';
    };

    document.getElementById('login-error-btn').addEventListener('click', removeHidden);
    overlay.addEventListener('click', removeHidden);
  } else if (modal === 'app') {
    // APP ERROR MODAL
    const errorApp = document.querySelector('.app-error-modal');
    const overlayApp = document.querySelector('.overlay-app');
    const errorAppText = document.getElementById('app-error-text');

    // tests what is the reason of the error NEED TO WORK ON!!!
    // first error = when we don't find an correspondent account
    errorAppText.textContent =
      "Error: We couldn't find that match of account to request. Please check again!";
    // show the error modal
    errorApp.classList.remove('hidden');
    overlayApp.classList.remove('hidden');
    const removeHidden = function () {
      // pick the overlay and made them disappear
      overlayApp.classList.add('hidden');
      errorApp.classList.add('hidden');
    };

    document.getElementById('app-error-btn').addEventListener('click', removeHidden);
    overlayApp.addEventListener('click', removeHidden);
  } else if (modal === 'close') {
    // APP ERROR MODAL
    const errorApp = document.querySelector('.app-error-modal');
    const overlayApp = document.querySelector('.overlay-app');
    const errorAppText = document.getElementById('app-error-text');

    // tests what is the reason of the error NEED TO WORK ON!!!
    // first error = when we don't find an correspondent account
    errorAppText.textContent = 'ACCOUNT CLOSED PRESS THE BUTTON TO GO BACK TO LOGIN';
    // show the error modal
    errorApp.classList.remove('hidden');
    overlayApp.classList.remove('hidden');
    const removeHidden = function (param) {
      // pick the overlay and made them disappear
      overlayApp.classList.add('hidden');
      errorApp.classList.add('hidden');
      if (param === 'goToLogin') window.location.href = 'index.html';
    };

    document.getElementById('app-error-btn').addEventListener('click', () => {
      removeHidden('goToLogin');
    });
    overlayApp.addEventListener('click', () => {
      removeHidden('goToLogin');
    });
  } else if (modal === 'requests') {
    // APP ERROR MODAL
    const errorApp = document.querySelector('.app-error-modal');
    const overlayApp = document.querySelector('.overlay-app');

    // tests what is the reason of the error NEED TO WORK ON!!!
    // errorAppText.textContent = `You have ${currentAccount.requestedMoves.length} requests for money, ${}`;

    // here we are recreating the appModal just to show the right values and messages and also create the transfer or ignore button
    errorApp.innerHTML = `<p id="app-error-text">User - ${currentAccount.requestedMoves[0][0]} -  is requesting for you a transfer of ${currentAccount.requestedMoves[0][1]}$</p><button id="app-error-btn">ignore</button><button id="modal-transfer-button" onclick="transfer('0')">transfer</button>`;
    // show the error modal
    errorApp.classList.remove('hidden');
    overlayApp.classList.remove('hidden');
    const removeHidden = function () {
      // pick the overlay and made them disappear
      overlayApp.classList.add('hidden');
      errorApp.classList.add('hidden');
    };

    document.getElementById('app-error-btn').addEventListener('click', removeHidden);
    overlayApp.addEventListener('click', removeHidden);
  }
};

function transfer(index) {
  let amount;
  let receiverAcc;
  if (index) {
    // if index is a number then the place that is calling for transfer is the button created into the modal
    // then we store ito into receiverAcc and bring with it the amount catch from requestedMoves array
    receiverAcc = retrieveAcc(currentAccount.requestedMoves[+index][0]);
    amount = currentAccount.requestedMoves[+index][1];
    currentAccount.requestedMoves.splice(+index, 1);
  } else {
    receiverAcc = retrieveAcc(transferToInput.value);
    amount = Number(transferAmount.value);
  }
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
    // reloading to avoid bugs
    window.location.reload();
  }
}
