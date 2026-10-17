import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import StoreApp from './App.jsx';
const products=[{id:1,title:'Canvas bag',description:'Simple bag',category:'Bags',image:'https://example.com/bag.jpg',price:2500},{id:2,title:'Cotton tee',description:'Simple tee',category:'Clothes',image:'https://example.com/tee.jpg',price:1000}];
afterEach(cleanup);
function setup(loader=()=>Promise.resolve(products),route='/shop'){const user=userEvent.setup();render(<MemoryRouter initialEntries={[route]}><StoreApp loader={loader}/></MemoryRouter>);return user;}
describe('shopping cart user flows',()=>{
  it('adds manually entered quantities, updates the bag badge, and totals the cart',async()=>{
    const user=setup();const heading=await screen.findByRole('heading',{name:'Canvas bag'});const card=heading.closest('article');const input=within(card).getByRole('spinbutton');
    await user.clear(input);await user.type(input,'3');await user.click(within(card).getByRole('button',{name:'Add to bag'}));
    await user.click(screen.getByRole('link',{name:'Bag (3)'}));
    expect(screen.getByRole('heading',{name:'Canvas bag'})).toBeInTheDocument();
    expect(screen.getByRole('spinbutton',{name:'Quantity for Canvas bag'})).toHaveValue(3);
    expect(screen.getAllByText('$75.00')).toHaveLength(2);
  });
  it('supports increment, decrement, direct editing and removal from the cart',async()=>{
    const user=setup();const card=(await screen.findByRole('heading',{name:'Canvas bag'})).closest('article');
    await user.click(within(card).getByRole('button',{name:'Increase Canvas bag'}));await user.click(within(card).getByRole('button',{name:'Add to bag'}));
    await user.click(screen.getByRole('link',{name:'Bag (2)'}));
    await user.click(screen.getByRole('button',{name:'Increase Canvas bag'}));expect(screen.getByRole('link',{name:'Bag (3)'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Decrease Canvas bag'}));expect(screen.getByRole('link',{name:'Bag (2)'})).toBeInTheDocument();
    const input=screen.getByRole('spinbutton',{name:'Quantity for Canvas bag'});await user.clear(input);await user.type(input,'4');
    expect(screen.getAllByText('$100.00')).toHaveLength(2);
    await user.click(screen.getByRole('button',{name:'Remove Canvas bag'}));expect(screen.getByRole('heading',{name:'Your bag is waiting.'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Bag',exact:true})).toBeInTheDocument();
  });
  it('combines repeated additions of the same product into a single line',async()=>{
    const user=setup();const card=(await screen.findByRole('heading',{name:'Cotton tee'})).closest('article');
    await user.click(within(card).getByRole('button',{name:'Add to bag'}));await user.click(within(card).getByRole('button',{name:'Add to bag'}));await user.click(screen.getByRole('link',{name:'Bag (2)'}));
    expect(screen.getAllByRole('button',{name:'Remove Cotton tee'})).toHaveLength(1);expect(screen.getAllByText('$20.00')).toHaveLength(2);
  });
  it('filters the catalog and displays an explicit empty search result',async()=>{
    const user=setup();await screen.findByRole('heading',{name:'Canvas bag'});await user.type(screen.getByRole('searchbox',{name:'Find an item'}),'tee');
    expect(screen.queryByRole('heading',{name:'Canvas bag'})).not.toBeInTheDocument();expect(screen.getByRole('heading',{name:'Cotton tee'})).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox',{name:'Find an item'}),'unmatched');expect(screen.getByText('No items match your search.')).toBeInTheDocument();
  });
  it('shows a failed catalog load and allows retry',async()=>{
    const loader=vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(products);const user=setup(loader);
    expect(await screen.findByRole('alert')).toHaveTextContent('catalog could not be loaded');await user.click(screen.getByRole('button',{name:'Try again'}));
    expect(await screen.findByRole('heading',{name:'Canvas bag'})).toBeInTheDocument();
  });
  it('restores an invalid cart quantity on blur without removing the item',async()=>{
    const user=setup();const card=(await screen.findByRole('heading',{name:'Canvas bag'})).closest('article');await user.click(within(card).getByRole('button',{name:'Add to bag'}));await user.click(screen.getByRole('link',{name:'Bag (1)'}));
    const input=screen.getByRole('spinbutton',{name:'Quantity for Canvas bag'});await user.clear(input);await user.tab();expect(input).toHaveValue(1);expect(screen.getByRole('link',{name:'Bag (1)'})).toBeInTheDocument();
  });
});
