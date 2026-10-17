const form = document.querySelector('#practice-form');
const fields = [...form.querySelectorAll('input,select')];
const postalRules = {
  UZ: [/^\d{6}$/, 'Use 6 digits, for example 100000.'],
  US: [/^\d{5}(-\d{4})?$/, 'Use a US ZIP code, for example 10001 or 10001-1234.'],
  CA: [/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i, 'Use a Canadian postal code, for example K1A 0B1.'],
  GB: [/^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i, 'Use a UK postcode, for example SW1A 1AA.'],
};
function validate(field) {
  field.setCustomValidity('');
  let message = '';
  if (!field.value.trim()) message = field.id === 'country' ? 'Choose a country.' : `${field.labels[0].textContent} is required.`;
  else if (field.id === 'email' && field.validity.typeMismatch) message = 'Enter an email address such as name@example.com.';
  else if (field.id === 'password' && field.value.length < 8) message = 'Use at least 8 characters.';
  else if (field.id === 'confirmation' && field.value !== form.elements.password.value) message = 'The passwords must match.';
  else if (field.id === 'postal') {
    const rule = postalRules[form.elements.country.value];
    if (!rule) message = 'Choose your country first.';
    else if (!rule[0].test(field.value.trim())) message = rule[1];
  }
  field.setCustomValidity(message);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  document.querySelector(`#${field.id}-error`).textContent = message;
  return field.checkValidity();
}
for (const field of fields) {
  const update = () => {
    validate(field);
    if (field.id === 'country' && form.elements.postal.value) validate(form.elements.postal);
    if (field.id === 'password' && form.elements.confirmation.value) validate(form.elements.confirmation);
    document.querySelector('#result').textContent = '';
  };
  field.addEventListener('input', update);
  field.addEventListener('change', update);
  field.addEventListener('blur', update);
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const valid = fields.map(validate).every(Boolean);
  document.querySelector('#result').textContent = valid ? 'High five! Everything looks good. 🙌' : 'Please correct the highlighted fields before continuing.';
  if (!valid) fields.find(field => !field.validity.valid)?.focus();
});
