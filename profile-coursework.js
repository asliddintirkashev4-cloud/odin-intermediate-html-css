"use strict";
const search=document.querySelector('#activity-search');const activityRows=[...document.querySelectorAll('#activities-body tr')];
search.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();let count=0;for(const row of activityRows){row.hidden=!row.dataset.search.includes(query);if(!row.hidden)count++;}document.querySelector('#activity-count').textContent=`${count} activities`;});
const filter=document.querySelector('#project-filter');const projects=[...document.querySelectorAll('#project-archive .archive-row')];
filter.addEventListener('change',()=>{let count=0;for(const project of projects){project.hidden=filter.value!=='all'&&project.dataset.course!==filter.value;if(!project.hidden)count++;}document.querySelector('#project-count').textContent=`${count} project assignments`;});
const links=[...document.querySelectorAll('.site-nav>div a')];const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const link of links){if(link.getAttribute('href')==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}
