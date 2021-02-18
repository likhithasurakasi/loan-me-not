"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

class Movement {
  constructor(name, amount, date, why, type) {
    this.name = name;
    this.amount = amount;
    this.date = date;
    this.why = why;
    this.type = type;
  }
}

class Account {
  constructor(owner, pin, username) {
    this.owner = owner;
    this.movements = [];
    this.pin = pin;
    this.username = username;
    this.currency = "INR";
    this.locale = navigator.locale;
  }
}

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [
    { name: "g", amount: 10, date: Date.now(), why: "t", type: "deposit" },
  ],
  pin: 1111,
  currency: "EUR",
  locale: "pt-PT", // de-DE
  username: "js",
};
const account2 = {
  owner: "Joan Jett",
  movements: [
    {
      name: "heath",
      amount: 1000,
      date: Date.now(),
      why: "coke",
      type: "withdrawal",
    },
  ],
  pin: 2222,
  currency: "EUR",
  locale: "pt-PT", // de-DE
  username: "jj",
};

const accounts = JSON.parse(localStorage.getItem("accounts")) ?? [
  account1,
  account2,
];

console.log(accounts);
/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");
const logo = document.querySelector(".logo");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");
const navSignup = document.getElementById("signup");
const containerLogin = document.querySelector(".login");
const overlay = document.querySelector(".overlay");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const btnSignup = document.querySelector(".signup__btn");
const btnSave = document.querySelector(".form__btn--save");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferName = document.querySelector(".form__input--name");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputTransferDate = document.querySelector(".form__input--date");
const inputTranferWhy = document.querySelector(".form__input--why");
const inputLoanName = document.querySelector(".form__input-loan--name");
const inputLoanAmount = document.querySelector(".form__input-loan--amount");
const inputLoanDate = document.querySelector(".form__input-loan--date");
const inputLoanWhy = document.querySelector(".form__input-loan--why");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
const inputSignupName = document.querySelector(".signup__input--name");
const inputSignupUsername = document.querySelector(".signup__input--user");
const inputSignupPin = document.querySelector(".signup__input--pin");

/////////////////////////////////////////////

let currentAccount;
let sorted;

/// EVENT HANDLERS
btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;
    navSignup.style.display = "none";
    if (
      Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      ) <= 425
    )
      containerLogin.style.display = "none";
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    // set sorted to false
    sorted = false;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    // Update UI
    updateUI(currentAccount);
  } else {
    displayError();
    return;
  }
});
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const name = inputTransferName.value;
  const why = inputTranferWhy.value;
  const date = new Date(inputTransferDate.value).getTime();
  const amount = Number(inputTransferAmount.value);
  if (!validInput(name, why) || amount <= 0 || !isFinite(date)) {
    displayError();
    return;
  }
  const movement = new Movement(name, amount, date, why, "deposit");
  currentAccount.movements.push(movement);
  inputTransferAmount.value = inputTransferName.value = inputTranferWhy.value = inputTransferDate.value =
    "";
  inputTranferWhy.blur();
  setLocalStorage();
  updateUI(currentAccount);
});
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const name = inputLoanName.value;
  const why = inputLoanWhy.value;
  const date = new Date(inputLoanDate.value).getTime();
  const amount = Number(inputLoanAmount.value);
  if (!validInput(name, why) || amount <= 0 || !isFinite(date)) {
    displayError();
    return;
  }
  const movement = new Movement(name, -amount, date, why, "withdrawal");
  currentAccount.movements.push(movement);
  inputLoanAmount.value = inputLoanName.value = inputLoanWhy.value = inputLoanDate.value =
    "";

  inputTranferWhy.blur();
  setLocalStorage();
  updateUI(currentAccount);
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    setLocalStorage();
    containerApp.style.opacity = 0;
  } else {
    displayError();
  }

  inputCloseUsername.value = inputClosePin.value = "";
});
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

btnSignup.addEventListener("click", function (e) {
  e.preventDefault();
  const owner = inputSignupName.value;
  const username = inputSignupUsername.value;
  const pin = inputSignupPin.value;

  if (!validInput(owner, username) || !isFinite(pin)) {
    displayError();
    return;
  }
  const account = new Account(owner, Number(pin), username);
  currentAccount = account;
  accounts.push(account);
  navSignup.style.display = "none";
  labelWelcome.textContent = `Welcome , ${currentAccount.owner.split(" ")[0]}`;
  containerApp.style.opacity = 100;
  if (
    Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    ) <= 425
  )
    containerLogin.style.display = "none";
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);
  // Clear input fields
  inputSignupUsername.value = inputSignupPin.value = inputSignupName.value = "";
  inputSignupPin.blur();
  setLocalStorage();
  updateUI(currentAccount);
});

btnSave.addEventListener("click", function () {
  setLocalStorage();
  containerApp.style.opacity = 0;
  navSignup.style.display = "block";
  labelWelcome.textContent = "Log in to get started";
  containerLogin.style.display = "block";
});

const validInput = (...input) => input.every((inp) => inp !== "");
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(date, new Date());
  if (daysPassed == 0) return "today";
  if (daysPassed == 1) return "yesterday";
  if (daysPassed < 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = (value, locale, currency) =>
  Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a.amount - b.amount)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const displayDate = formatMovementDate(mov.date, currentAccount.locale);
    const html = `
    <div class="movements__row" data-src=${i}>
    <div class="clear">
    <span class="material-icons" >
      clear
    </span>
  </div>
    <div class="movements__type movements__type--${mov.type}">
      ${mov.type === "deposit" ? "loan me not" : "loan me"}
    </div>
    <div class="movements_unflex">
      <div class="movements__date">
        <span style="font-size: 1.5rem">🕰</span> ${displayDate}
      </div>
      <div class="movements__person">
        <span style="font-size: 1.5rem">${
          mov.type == "deposit" ? "😈" : "👿"
        }</span> ${mov.name}
      </div>
      <div class="movements__deets">
        <span style="font-size: 1.5rem">💰</span> ${mov.why}
      </div>
    </div>
    <div class="movements__value">${formatCur(
      mov.amount,
      currentAccount.locale,
      currentAccount.currency
    )}</div>
  </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements
    .map((mov) => mov.amount)
    .reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;

  console.log(acc.balance);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov.type == "deposit")
    .map((mov) => mov.amount)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov.type === "withdrawal")
    .map((mov) => mov.amount)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const setLocalStorage = function () {
  localStorage.setItem("accounts", JSON.stringify(accounts));
};
const displayError = function () {
  overlay.style.display = "block";
  setTimeout(function () {
    overlay.style.display = "none";
  }, 2000);
};

containerMovements.addEventListener("click", function (e) {
  const link = e.target;
  if (link.closest(".clear")) {
    const src = link.closest(".movements__row").dataset.src;
    console.log(src);
    console.log(currentAccount.movements.splice(src));
    setLocalStorage();
    updateUI(currentAccount);
  }
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
