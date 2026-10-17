import {NavLink,Route,Routes} from 'react-router-dom';
import Basics from './Basics.jsx';
import ClassTasks from './ClassTasks.jsx';
import Messenger from './Messenger.jsx';
export default function PracticeApp(){return <><header><a href="../index.html">React practice</a><nav aria-label="Practice navigation"><NavLink to="/" end>Basics</NavLink><NavLink to="/tasks">Class tasks</NavLink><NavLink to="/reducers">Reducers</NavLink></nav></header><main><Routes><Route path="/" element={<Basics/>}/><Route path="/tasks" element={<ClassTasks/>}/><Route path="/reducers" element={<Messenger/>}/><Route path="*" element={<p>Choose an exercise from the navigation.</p>}/></Routes></main><footer>Component, JSX, props, lists, state, classes, routing, context, reducer and ref exercises.</footer></>;}
