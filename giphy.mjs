import {findGIF} from './giphy-api.mjs';
const form = document.querySelector('#gif-form');
const status = document.querySelector('#status');
const image = document.querySelector('#gif');
const another = document.querySelector('#another');
let generation = 0;
function search() {
  const current = ++generation;
  if (!form.reportValidity()) return;
  status.textContent = 'Finding a little motion…';
  form.setAttribute('aria-busy','true'); another.disabled = true;
  findGIF(form.elements.term.value,form.elements.key.value)
    .then(result => {
      if (generation !== current) return;
      image.alt = result.title; image.src = result.url; image.hidden = false;
      status.textContent = 'A new GIF, just for this moment.';
    })
    .catch(error => {
      if (generation !== current) return;
      status.textContent = error instanceof TypeError ? 'The connection failed. Please try again.' : error.message;
    })
    .finally(() => {
      if (generation !== current) return;
      form.setAttribute('aria-busy','false'); another.disabled = false;
    });
}
form.addEventListener('submit',event => {event.preventDefault();search();});
another.addEventListener('click',search);
image.addEventListener('error',()=>{status.textContent='The GIF image could not be loaded. Try another one.';image.hidden=true;});
