/* Progressive enhancement only. Every publication and bound is already in HTML. */
const root=new URL(document.documentElement.dataset.siteRoot||'./',document.baseURI);
const query=new URLSearchParams(location.search);
const stableId=/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,149}$/;
// Preserve bookmarked links from the earlier JSON browser without loading an index.
for(const [key,directory] of [['record','records'],['category','lists'],['problem','problems']]){
 const id=query.get(key);
 if(id&&stableId.test(id)){
  const target=new URL(`${directory}/${encodeURIComponent(id)}/index.html`,root);
  if(target.pathname!==location.pathname)location.replace(target.href);
  break;
 }
}
for(const enhancement of document.querySelectorAll('[data-enhance]'))enhancement.hidden=false;
for(const input of document.querySelectorAll('[data-local-filter]')){
 const rows=[...document.querySelectorAll('[data-filter-row]')];
 const count=input.parentElement.querySelector('[data-filter-count]');
 input.addEventListener('input',()=>{
  const query=input.value.trim().toLocaleLowerCase();let shown=0;
  for(const row of rows){const visible=!query||row.textContent.toLocaleLowerCase().includes(query);row.hidden=!visible;if(visible)shown++;}
  count.textContent=query?`${shown} of ${rows.length} visible on this page`:'';
 });
}
// Native navigation controls enhance ordinary links; all destinations are precompiled.
const sidebar=document.querySelector('.sidebar-navigation');
if(sidebar){const narrow=window.matchMedia('(max-width:850px)');const updateSidebar=()=>{sidebar.open=!narrow.matches;};updateSidebar();narrow.addEventListener('change',updateSidebar);}
for(const select of document.querySelectorAll('[data-category-navigation]')){
 select.addEventListener('change',()=>{const target=new URL(select.value,document.baseURI);if(target.origin===location.origin)location.assign(target.href);});
}
for(const link of document.querySelectorAll('a[href="#definition"]')){
 link.addEventListener('click',()=>{const definition=document.querySelector('details#definition');if(definition)definition.open=true;});
}
