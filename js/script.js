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

const accounts = [account1, account2];
let currentAccount;

//function created to update local storage DON'T IS WORKING
function updateLocalStorage() {
  accounts.forEach(element => {
    localStorage.setItem(element.username, JSON.stringify(element));
  });
}

// this is the function that store all accounts into localStorage
function webStoreAccounts() {
  // creating the test variables into local storage
  accounts.forEach((element, index) => {
    element.balance = element.movements.reduce((acc, cur) => acc + cur);
    element.active = false;
    localStorage.setItem(element.username, JSON.stringify(element));
  });
}
// the login function only needs to redirect the user into the app page
function login() {
  webStoreAccounts();
  // saving the current account that we are into
  currentAccount = accounts.find(
    acc => acc.username === loginUsername.value && acc.pin === Number(loginPw.value)
  );
  currentAccount.active = true;
  localStorage.setItem(currentAccount.username, JSON.stringify(currentAccount));

  // block to check if currentAccount is true (values corresponding)
  if (currentAccount) {
    window.location.href = 'app.html';
    // displayUI(currentAccount.movements); ------- ERROR we need a way to persist objects through page reload
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
function displayUI() {
  // this function will start when app.html load
  // searching for the account with active true
  accounts.forEach(acc => {
    JSON.parse(localStorage.getItem(acc.username)).balance = JSON.parse(
      localStorage.getItem(acc.username)
    ).movements.reduce((acc, cur) => acc + cur);
    // we need a way to make this work!
    if (JSON.parse(localStorage.getItem(acc.username)).active === true) {
      // storing that account into movements
      movements = JSON.parse(localStorage.getItem(acc.username)).movements;
      currentAccount = JSON.parse(localStorage.getItem(acc.username));
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
    const receiverAcc = JSON.parse(localStorage.getItem(transferToInput.value));
    const amount = Number(transferAmount.value);
    if (
      amount <= currentAccount.balance &&
      receiverAcc &&
      receiverAcc.username !== currentAccount.username
    ) {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      transferAmount.value = transferToInput.value = '';
      localStorage.setItem(receiverAcc.username, JSON.stringify(receiverAcc));
      localStorage.setItem(currentAccount.username, JSON.stringify(currentAccount));
      console.log(receiverAcc);
      console.log(currentAccount);
      displayUI();
    }
  });
}
console.log('hello world');
