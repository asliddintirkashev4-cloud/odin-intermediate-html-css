import {createContext,useContext,useEffect,useReducer,useState} from 'react';
import {loadProducts} from './catalog.js';
const StoreContext=createContext(null);
export function cartReducer(cart,action) {
  if(action.type==='remove')return cart.filter(line=>line.id!==action.id);
  if(action.type==='set')return cart.map(line=>line.id===action.id?{...line,quantity:Math.max(1,Math.min(99,action.quantity))}:line);
  if(action.type==='add') {
    const current=cart.find(line=>line.id===action.id);
    if(current)return cart.map(line=>line.id===action.id?{...line,quantity:Math.min(99,line.quantity+action.quantity)}:line);
    return [...cart,{id:action.id,quantity:Math.max(1,Math.min(99,action.quantity))}];
  }
  throw new Error('Unknown cart action.');
}
export function StoreProvider({children,loader=loadProducts}) {
  const [products,setProducts]=useState([]);
  const [status,setStatus]=useState('loading');
  const [attempt,setAttempt]=useState(0);
  const [cart,dispatch]=useReducer(cartReducer,[]);
  const [announcement,setAnnouncement]=useState('');
  useEffect(()=>{
    let active=true;
    loader().then(data=>{if(active){setProducts(data);setStatus('ready');}}).catch(()=>{if(active)setStatus('error');});
    return ()=>{active=false;};
  },[loader,attempt]);
  const itemCount=cart.reduce((sum,line)=>sum+line.quantity,0);
  const total=cart.reduce((sum,line)=>sum+(products.find(product=>product.id===line.id)?.price??0)*line.quantity,0);
  function addItem(id,quantity) {
    const existing=cart.find(line=>line.id===id)?.quantity??0;
    const accepted=Math.min(quantity,99-existing);
    if(accepted>0)dispatch({type:'add',id,quantity:accepted});
    setAnnouncement(accepted>0?`Added ${accepted} ${accepted===1?'item':'items'} to your bag.`:'This item has reached the limit of 99.');
  }
  return <StoreContext.Provider value={{products,status,cart,itemCount,total,announcement,addItem,setQuantity:(id,quantity)=>dispatch({type:'set',id,quantity}),removeItem:id=>{dispatch({type:'remove',id});setAnnouncement('Item removed from your bag.');},retry:()=>{setStatus('loading');setAttempt(value=>value+1);}}}>{children}</StoreContext.Provider>;
}
export function useStore(){const store=useContext(StoreContext);if(!store)throw new Error('StoreProvider is required.');return store;}
