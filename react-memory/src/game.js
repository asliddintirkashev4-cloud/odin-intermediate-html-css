export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index],result[target]] = [result[target],result[index]];
  }
  return result;
}
export function selectCard(state, id, total) {
  if (state.outcome !== 'playing') return state;
  if (state.selected.includes(id)) return {...state,selected:[],outcome:'lost'};
  const selected = [...state.selected,id];
  return {selected,best:Math.max(state.best,selected.length),outcome:selected.length === total ? 'won' : 'playing'};
}
let pending;
const cacheKey = 'pocket-recall-cards-v1';
export function loadCards() {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && Date.now()-cached.saved < 7*86400000 && cached.cards?.length === 12 && cached.cards.every(card=>Number.isInteger(card.id)&&typeof card.name==='string'&&typeof card.image==='string')) return Promise.resolve(cached.cards);
  } catch {}
  if (pending) return pending;
  pending = Promise.all(Array.from({length:12},(_,index)=>fetch(`https://pokeapi.co/api/v2/pokemon/${index+1}/`).then(response=>{
    if (!response.ok) throw new Error(`PokéAPI returned HTTP ${response.status}.`);
    return response.json();
  }).then(data=>({id:data.id,name:data.name,image:data.sprites.front_default})))).then(cards=>{
    try {localStorage.setItem(cacheKey,JSON.stringify({saved:Date.now(),cards}));}catch{}
    return cards;
  }).catch(error=>{pending=null;throw error;});
  return pending;
}
