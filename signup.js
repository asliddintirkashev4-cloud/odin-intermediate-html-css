'use strict';

const registration = document.querySelector('#registration');
const password = document.querySelector('#password');
const confirmation = document.querySelector('#confirmation');
const matchError = document.querySelector('#match-error');
const result = document.querySelector('#result');

function validateMatch() {
  const mismatch = confirmation.value !== '' && confirmation.value !== password.value;
  confirmation.setCustomValidity(mismatch ? 'Passwords must match.' : '');
  confirmation.setAttribute('aria-invalid', String(mismatch));
  matchError.textContent = mismatch ? 'Passwords must match.' : '';
}

password.addEventListener('input', validateMatch);
confirmation.addEventListener('input', validateMatch);
registration.addEventListener('input', () => { result.textContent = ''; });
registration.addEventListener('submit', (event) => {
  event.preventDefault();
  validateMatch();
  if (!registration.reportValidity()) return;
  result.textContent = 'Your form is valid. Demo complete — no account was created.';
  registration.reset();
  validateMatch();
});

registration.querySelector('button[type=submit]').disabled = false;
