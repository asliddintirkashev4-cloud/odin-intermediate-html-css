import {Component} from 'react';
export class Count extends Component {render(){return <p role="status">{this.props.value} {this.props.value===1?'task':'tasks'}</p>;}}
export default class ClassInput extends Component {
  state={tasks:[{id:'first',text:'Review components',editing:false,draft:'Review components'}],newTask:'',error:''};
  add=event=>{event.preventDefault();const text=this.state.newTask.trim();if(!text)return;const id=crypto.randomUUID();this.setState(previous=>({tasks:[...previous.tasks,{id,text,draft:text,editing:false}],newTask:'',error:''}));};
  remove=id=>{this.setState(previous=>({tasks:previous.tasks.filter(task=>task.id!==id),error:''}));};
  edit=id=>{this.setState(previous=>({tasks:previous.tasks.map(task=>task.id===id?{...task,editing:true,draft:task.text}:task)}));};
  update=(id,value)=>{this.setState(previous=>({tasks:previous.tasks.map(task=>task.id===id?{...task,draft:value}:task)}));};
  save=id=>{const task=this.state.tasks.find(task=>task.id===id);if(!task.draft.trim()){this.setState({error:'Task text is required.'});return;}this.setState(previous=>({tasks:previous.tasks.map(task=>task.id===id?{...task,text:task.draft.trim(),editing:false}:task),error:''}));};
  render(){return <section><h1>Class-based task list</h1><Count value={this.state.tasks.length}/><form onSubmit={this.add}><label>New task<input value={this.state.newTask} onChange={event=>this.setState({newTask:event.target.value})} required/></label><button>Add task</button></form><p role="alert">{this.state.error}</p><ul className="tasks">{this.state.tasks.map(task=><li key={task.id}>{task.editing?<><label>Edit task<input value={task.draft} onChange={event=>this.update(task.id,event.target.value)}/></label><button onClick={()=>this.save(task.id)}>Resubmit</button></>:<><span>{task.text}</span><button onClick={()=>this.edit(task.id)} aria-label={`Edit ${task.text}`}>Edit</button></>}<button onClick={()=>this.remove(task.id)} aria-label={`Delete ${task.text}`}>Delete</button></li>)}</ul></section>;}
}
