import {StrictMode,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {loadCards,shuffle,selectCard} from './game.js';
import './style.css';
function initialGame() {
  let best=0;try{best=Number(localStorage.getItem('pocket-recall-best-v1'))||0;}catch{}
  return {selected:[],best:Math.max(0,Math.min(12,best)),outcome:'playing'};
}
function Scoreboard({score,best,total}) {
  return <div className="scoreboard"><div><span>This round</span><strong>{score}<small>/{total}</small></strong></div><div><span>Personal best</span><strong>{best}</strong></div></div>;
}
function MemoryCard({card,onSelect,disabled}) {
  return <button className="memory-card" onClick={()=>onSelect(card.id)} disabled={disabled} aria-label={`Choose ${card.name}`}><span className="number">No. {String(card.id).padStart(3,'0')}</span><img src={card.image} alt="" width="96" height="96"/><span className="name">{card.name}</span></button>;
}
function App() {
  const [cards,setCards]=useState([]);
  const [game,setGame]=useState(initialGame);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;
    loadCards().then(data=>{if(active){setCards(shuffle(data));setError('');}}).catch(()=>{if(active)setError('The cards could not be loaded from PokéAPI. Check your connection and try again.');});
    return ()=>{active=false;};
  },[attempt]);
  useEffect(()=>{try{localStorage.setItem('pocket-recall-best-v1',String(game.best));}catch{}},[game.best]);
  function choose(id) {
    if(game.outcome!=='playing')return;
    setGame(previous=>selectCard(previous,id,cards.length));
    setCards(shuffle(cards));
  }
  function restart(){setGame(previous=>({selected:[],best:previous.best,outcome:'playing'}));setCards(shuffle(cards));}
  const message = game.outcome==='won'?'Twelve faces, perfectly remembered. You win!':game.outcome==='lost'?'A familiar face! That card was already picked. Try a new round.':cards.length?'Choose a card you have not picked before. The cards move after every pick.':'Gathering twelve familiar faces…';
  return <><header><a className="brand" href="../index.html">pocket recall<span>A small test of a good memory.</span></a><a href="../index.html">All projects ↗</a></header><main><section className="intro"><div><p className="eyebrow">Memory card / React</p><h1>Meet once.<br/>Remember twice.</h1><p>Pick all twelve without choosing the same Pokémon again.</p></div><Scoreboard score={game.selected.length} best={game.best} total={12}/></section><div className="round"><p role="status">{message}</p>{cards.length?<button className="restart" onClick={restart}>New round ↗</button>:null}</div>{error?<div className="error" role="alert"><p>{error}</p><button onClick={()=>{setError('');setAttempt(value=>value+1);}}>Try again</button></div>:<section className="cards" aria-label="Memory cards" aria-busy={!cards.length}>{cards.map(card=><MemoryCard key={card.id} card={card} onSelect={choose} disabled={game.outcome!=='playing'}/>)}</section>}</main><footer><p>Names and images from <a href="https://pokeapi.co/">PokéAPI</a>. Pokémon belongs to its respective owners. A learning project.</p></footer></>;
}
createRoot(document.querySelector('#root')).render(<StrictMode><App/></StrictMode>);
