import {Route,Routes,Link} from 'react-router-dom';
import {StoreProvider,useStore} from './state.jsx';
import {Navigation,HomePage,ShopPage,CartPage} from './components.jsx';
function Layout(){const {announcement}=useStore();return <><a className="skip" href="#content">Skip navigation</a><Navigation/><div id="content" tabIndex="-1"><Routes><Route path="/" element={<HomePage/>}/><Route path="/shop" element={<ShopPage/>}/><Route path="/cart" element={<CartPage/>}/><Route path="*" element={<main className="empty"><h1>A quiet corner.</h1><p>This page could not be found.</p><Link to="/shop">Visit the shop</Link></main>}/></Routes></div><p className="sr-only" role="status">{announcement}</p><footer><span>Commonplace · A learning project</span><a href="https://fakestoreapi.com/">Catalog from FakeStore API ↗</a><a href="../index.html">All coursework ↗</a></footer></>;}
export default function StoreApp({loader}){return <StoreProvider loader={loader}><Layout/></StoreProvider>;}
