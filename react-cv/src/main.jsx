import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GeneralSection, EducationSection, ExperienceSection, CVPreview} from './components/Sections.jsx';
import './styles/app.css';
const sample = {
  general:{name:'Alex Morgan',email:'alex@example.com',phone:'555-0100'},
  education:{school:'Northfield College',study:'Computer Science',date:'2026'},
  experience:{company:'Sample Studio',position:'Frontend Intern',responsibilities:'Built responsive interfaces and improved form accessibility. Collaborated on small web projects and reviewed changes with the team.',from:'2026-01',until:'2026-06'},
};
function App() {
  const [profile,setProfile] = useState(sample);
  const [editing,setEditing] = useState(true);
  const [error,setError] = useState('');
  const update = (section,name,value) => {
    setProfile(previous=>({...previous,[section]:{...previous[section],[name]:value}}));
    setError('');
  };
  function submit(event) {
    event.preventDefault();
    if (profile.experience.until && profile.experience.until < profile.experience.from) {setError('The end date must be on or after the start date.');return;}
    setError('');setEditing(false);
  }
  return <><header><a className="brand" href="../index.html">papertrail<span>A clear next chapter.</span></a><a href="../index.html">All projects ↗</a></header><main><div className="intro"><div><p className="eyebrow">CV application / React</p><h1>Make your experience<br/>easy to see.</h1><p>A simple, thoughtful place to put your story together.</p></div>{!editing?<button onClick={()=>setEditing(true)}>Edit CV</button>:null}</div><p className="notice">Fictional sample profile. Replace it with your own details. Information stays in this page’s memory.</p><div className={editing?'workspace':'workspace preview-only'}>{editing?<form onSubmit={submit} aria-label="CV details"><GeneralSection value={profile.general} onChange={(name,value)=>update('general',name,value)}/><EducationSection value={profile.education} onChange={(name,value)=>update('education',name,value)}/><ExperienceSection value={profile.experience} onChange={(name,value)=>update('experience',name,value)}/><p role="alert" className="error">{error}</p><button type="submit">Save CV &amp; preview ↗</button></form>:null}<section aria-label="CV preview" className="preview-area"><div className="preview-label"><span>{editing?'Live preview':'Your CV'}</span><span>A4 / document view</span></div><CVPreview profile={profile}/></section></div><p role="status" className="saved">{editing?'':'Your CV is ready to review. Choose Edit CV to make changes.'}</p></main><footer>Papertrail · The Odin Project</footer></>;
}
createRoot(document.querySelector('#root')).render(<StrictMode><App/></StrictMode>);
