function Field({label,name,value,onChange,type='text',required=true,...rest}) {
  return <label className="field">{label}<input name={name} value={value} type={type} required={required} onChange={event=>onChange(name,event.target.value)} {...rest}/></label>;
}
export function GeneralSection({value,onChange}) {
  return <fieldset><legend><span>01</span>General information</legend><Field label="Full name" name="name" value={value.name} onChange={onChange} autoComplete="name"/><Field label="Email" name="email" type="email" value={value.email} onChange={onChange} autoComplete="email"/><Field label="Phone number" name="phone" type="tel" value={value.phone} onChange={onChange} autoComplete="tel"/></fieldset>;
}
export function EducationSection({value,onChange}) {
  return <fieldset><legend><span>02</span>Education</legend><Field label="School name" name="school" value={value.school} onChange={onChange}/><Field label="Title of study" name="study" value={value.study} onChange={onChange}/><Field label="Date of study" name="date" value={value.date} onChange={onChange} placeholder="For example, 2022–2026"/></fieldset>;
}
export function ExperienceSection({value,onChange}) {
  return <fieldset><legend><span>03</span>Practical experience</legend><Field label="Company name" name="company" value={value.company} onChange={onChange}/><Field label="Position title" name="position" value={value.position} onChange={onChange}/><label className="field">Main responsibilities<textarea name="responsibilities" value={value.responsibilities} onChange={event=>onChange('responsibilities',event.target.value)} required rows={5}/></label><div className="dates"><Field label="Worked from" name="from" type="month" value={value.from} onChange={onChange}/><Field label="Worked until (blank for present)" name="until" type="month" required={false} value={value.until} onChange={onChange}/></div></fieldset>;
}
function month(value) { if(!value)return 'Present';const [year,number]=value.split('-');return `${new Date(Number(year),Number(number)-1,1).toLocaleDateString('en',{month:'short'})} ${year}`; }
export function CVPreview({profile}) {
  const {general,education,experience}=profile;
  return <article className="paper"><div className="cv-heading"><h2>{general.name||'Your name'}</h2><p>{general.email} {general.email&&general.phone?'· ':''}{general.phone}</p></div><section><h3>Experience</h3><div className="cv-row"><h4>{experience.position||'Position title'}</h4><span>{experience.from?month(experience.from):'Start'} – {month(experience.until)}</span></div><p className="organization">{experience.company}</p><p className="responsibilities">{experience.responsibilities}</p></section><section><h3>Education</h3><div className="cv-row"><h4>{education.study||'Title of study'}</h4><span>{education.date}</span></div><p className="organization">{education.school}</p></section></article>;
}
