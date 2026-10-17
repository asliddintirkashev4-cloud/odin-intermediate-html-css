let pending;
export function loadProducts() {
  if(pending)return pending;
  pending=fetch('https://fakestoreapi.com/products').then(response=>{
    if(!response.ok)throw new Error(`Catalog returned HTTP ${response.status}.`);
    return response.json();
  }).then(data=>{
    if(!Array.isArray(data))throw new Error('Invalid catalog response.');
    const products=data.filter(product=>Number.isInteger(product.id)&&typeof product.title==='string'&&Number.isFinite(product.price)&&product.price>=0).map(product=>({id:product.id,title:product.title,description:product.description??'',category:product.category??'Collection',image:product.image,price:Math.round(product.price*100)}));
    if(!products.length)throw new Error('The catalog is empty.');
    return products;
  }).catch(error=>{pending=null;throw error;});
  return pending;
}
const formatter=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
export const money=cents=>formatter.format(cents/100);
export const validQuantity=value=>Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=99&&String(value).trim()!=='';
