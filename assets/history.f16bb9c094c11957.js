/* Selected historical series only. No record database or bibliography is loaded here. */
export const HISTORY_COLORS=['#7ad8bc','#f0ba76','#8cb9ff','#d9a0ed','#f0808b','#cadb7a','#85d2e9','#d3b8a0'];
const DASHES=['','8 4','3 3','12 4 3 4','10 3','2 5','15 4','7 3 2 3'];
export const MAX_SERIES=8;
export const resolveCategoryId=(id,aliases={})=>Object.prototype.hasOwnProperty.call(aliases,id)?aliases[id]:id;
export const MAX_OTHER_MARKERS=240;
export function clipEvents(points=[],from,until){return points.filter(point=>(!from||point.date>=from)&&(!until||point.date<=until));}
export function eventPagesForRange(pages=[],from,until){return pages.filter(page=>(!from||!page.until||page.until>=from)&&(!until||!page.from||page.from<=until));}
export function sampleOtherMarkers(points,max=MAX_OTHER_MARKERS){if(points.length<=max)return points;return Array.from({length:max},(_,i)=>points[Math.round(i*(points.length-1)/(max-1))]);}
export const escapeHTML=(value='')=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeId=/^[A-Za-z0-9][A-Za-z0-9_-]{0,149}$/;
const pointTooltip=point=>[point.title||point.id,(point.authors||[]).join(' · ')].filter(Boolean).join('\n');
const shortNumber=value=>Number(value).toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function scaleKey(meta){return [String(meta.metric).replace(/\s+/g,''),String(meta.parameter).replace(/\s+/g,''),meta.direction].join('|');}
export function groupSeries(series){const groups=new Map();for(const entry of series){if(entry.visible===false)continue;const key=scaleKey(entry.meta);if(!groups.has(key))groups.set(key,{key,metric:entry.meta.metric,parameter:entry.meta.parameter,direction:entry.meta.direction,series:[]});groups.get(key).series.push(entry);}return [...groups.values()];}
export function clipHistory(points,from,until){
 const selected=[];let carry;
 for(const point of points){if(from&&point.date<from){carry=point;continue}if(until&&point.date>until)break;selected.push({...point});}
 if(carry&&(!selected.length||selected[0].date!==from))selected.unshift({...carry,date:from,sourceDate:carry.sourceDate||carry.date,carried:true});
 return selected;
}
export function historyStepPath(points,{x,y,endX}){if(!points.length)return '';let d=`M${x(points[0]).toFixed(2)},${y(points[0]).toFixed(2)}`;for(let i=1;i<points.length;i++)d+=`H${x(points[i]).toFixed(2)}V${y(points[i]).toFixed(2)}`;return d+`H${Number(endX).toFixed(2)}`;}
export function rangeForSeries(series,{from='',until='',updatedAt}={}){
 if(from&&!validDate(from))throw Error('Choose a valid start date.');if(until&&!validDate(until))throw Error('Choose a valid end date.');
 const end=until||updatedAt;if(!validDate(end))throw Error('Choose a valid end date.');
 if(end>updatedAt)throw Error('The end date cannot be later than this data release.');
 const dates=series.flatMap(s=>[...s.points,...(s.otherPoints||[])].map(p=>p.date));const start=from||(dates.length?dates.reduce((a,b)=>a<b?a:b):end);
 if(start>end)throw Error('The start date must be before the end date.');return {from:start,until:end};
}
export function renderHistoryGroups(series,{from='',until='',updatedAt,root='../',showOthers=true}={}){
 const range=rangeForSeries(series,{from,until,updatedAt}),groups=groupSeries(series);
 if(!groups.length)return '<p class="history-empty">Choose at least one category to show its record history.</p>';
 const W=1100,H=380,left=72,right=25,top=26,bottom=50;
 return groups.map((group,groupIndex)=>{
  const visible=group.series.map(entry=>({...entry,colorIndex:entry.colorIndex??series.findIndex(s=>s.meta.id===entry.meta.id),window:clipHistory(entry.points,range.from,range.until),events:showOthers?clipEvents(entry.otherPoints,range.from,range.until):[]}));
  const all=visible.flatMap(entry=>[...entry.window,...entry.events]);
  const label=`${group.metric}; ${group.parameter}; ${group.direction==='max'?'larger':'smaller'} coefficient is better`;
  if(!all.length)return `<section class="history-plot-panel"><h2>${escapeHTML(group.metric)}</h2><p class="history-empty">No numerical record is known in the selected date range for these categories.</p></section>`;
  const sameDay=range.from===range.until,earliest=Date.parse(range.from),latest=Date.parse(range.until)+(sameDay?86399999:0),max=all.reduce((n,p)=>Math.max(n,p.coefficient),0),high=max?max*1.08:1;
  const x=p=>left+(Date.parse(p.date)-earliest)/(latest-earliest)*(W-left-right),y=p=>top+(high-p.coefficient)/high*(H-top-bottom);
  const grid=Array.from({length:6},(_,i)=>{const coefficient=high*(1-i/5),yy=top+i/5*(H-top-bottom);return `<line x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}" class="chart-grid"/><text x="${left-12}" y="${yy+4}" text-anchor="end" class="axis">${shortNumber(coefficient)}</text>`;}).join('');
  const ticks=(sameDay?[.5]:[0,.2,.4,.6,.8,1]).map(fraction=>{const xx=left+fraction*(W-left-right),date=new Date(earliest+fraction*(latest-earliest));return `<text x="${xx}" y="${H-16}" text-anchor="${fraction===0?'start':fraction===1?'end':'middle'}" class="axis">${date.toISOString().slice(0,10)}</text>`;}).join('');
  const lines=visible.map((entry,seriesIndex)=>{
   if(!entry.window.length&&!entry.events.length)return '';
   const colorIndex=entry.colorIndex??series.findIndex(s=>s.meta.id===entry.meta.id),color=HISTORY_COLORS[(colorIndex+8)%8],dash=DASHES[(colorIndex+8)%8];
   const actual=entry.window.filter(p=>!p.carried),stride=Math.max(1,Math.ceil(actual.length/72)),markers=actual.filter((_,i)=>i%stride===0||i===actual.length-1);
   const title=`${entry.meta.problemLabel} · ${entry.meta.name}`,otherMarkers=sampleOtherMarkers(entry.events);
   const otherHTML=otherMarkers.map(point=>{const description=`Other result — ${title}: ${pointTooltip(point)}; ${point.date}; ${shortNumber(point.coefficient)}`,xx=x(point),yy=y(point),d=5;return `<a href="${escapeHTML(root)}records/${encodeURIComponent(point.id)}/index.html" aria-label="${escapeHTML(description)}"><polygon class="history-other-marker" data-result="${escapeHTML(point.id)}" points="${xx.toFixed(2)},${(yy-d).toFixed(2)} ${(xx+d).toFixed(2)},${yy.toFixed(2)} ${xx.toFixed(2)},${(yy+d).toFixed(2)} ${(xx-d).toFixed(2)},${yy.toFixed(2)}" fill="var(--surface)" stroke="${color}" stroke-width="1.7"><title>${escapeHTML(pointTooltip(point))}</title></polygon></a>`;}).join('');
   return `<g class="history-series" data-series="${escapeHTML(entry.meta.id)}"><path d="${historyStepPath(entry.window,{x,y,endX:W-right})}" class="history-line" stroke="${color}"${dash?` stroke-dasharray="${dash}"`:''}/>${markers.map(point=>{const description=`${title}: ${pointTooltip(point)}; ${point.date}; ${shortNumber(point.coefficient)}`;return `<a href="${escapeHTML(root)}records/${encodeURIComponent(point.id)}/index.html" aria-label="${escapeHTML(description)}"><circle class="history-record-marker" cx="${x(point).toFixed(2)}" cy="${y(point).toFixed(2)}" r="4" fill="var(--surface)" stroke="${color}" stroke-width="2"><title>${escapeHTML(pointTooltip(point))}</title></circle></a>`;}).join('')}${otherHTML}</g>`;
  }).join('');
  const densityNotes=visible.filter(entry=>showOthers&&(entry.events.length>MAX_OTHER_MARKERS||entry.eventsComplete===false)).map(entry=>`<p class="history-density-note">${escapeHTML(entry.meta.problemLabel)} · ${escapeHTML(entry.meta.name)}: showing ${Math.min(MAX_OTHER_MARKERS,entry.events.length)} of ${entry.eventsComplete===false?(entry.otherTotal??entry.events.length):entry.events.length} other results in this interval. Narrow the date range or <a href="${escapeHTML(root)}lists/${encodeURIComponent(entry.meta.id)}/index.html">view the complete list</a> for every result.</p>`).join('');
  const plotKey=visible.map(entry=>`<span>${swatch(entry.colorIndex)}<strong>${escapeHTML(entry.meta.problemLabel)} · ${escapeHTML(entry.meta.name)}</strong></span>`).join('');
  return `<section class="history-plot-panel"><div class="history-plot-heading"><h2>Time coefficient</h2><span>${escapeHTML(label)}</span></div><div class="history-plot-key" aria-label="Chart legend">${plotKey}</div><div class="history-svg"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Overlaid record histories: horizontal bounds change only on their source dates."><title>${escapeHTML(group.series.map(s=>s.meta.problemLabel+' · '+s.meta.name).join(' / '))}</title>${grid}${ticks}${lines}</svg></div>${densityNotes}</section>`;
 }).join('');
}
function swatch(index){const dash=DASHES[index%8];return `<svg class="history-swatch" viewBox="0 0 30 12" aria-hidden="true"><path d="M0 6H30" stroke="${HISTORY_COLORS[index%8]}" stroke-width="3"${dash?` stroke-dasharray="${dash}"`:''}/></svg>`;}
export function renderHistoryLegend(series,{root='../',interactive=false}={}){
 if(!series.length)return '';
 return `<div class="history-legend">${series.map((entry,index)=>{const meta=entry.meta,colorIndex=entry.colorIndex??index;return `<section class="history-legend-item${entry.visible===false?' is-hidden':''}" data-history-series="${escapeHTML(meta.id)}"><div class="history-legend-top">${swatch(colorIndex)}${interactive?`<label><input type="checkbox" data-history-visible="${escapeHTML(meta.id)}"${entry.visible===false?'':' checked'}> <strong>${escapeHTML(meta.problemLabel)} · ${escapeHTML(meta.name)}</strong></label>`:`<strong>${escapeHTML(meta.problemLabel)} · ${escapeHTML(meta.name)}</strong>`}${interactive?`<button type="button" class="history-remove" data-history-remove="${escapeHTML(meta.id)}" aria-label="Remove ${escapeHTML(meta.problemLabel+' · '+meta.name)}">Remove</button>`:''}</div><p>${escapeHTML([meta.computation,meta.rigor,meta.instance].filter(Boolean).join(' · '))}</p><details><summary>Regime and assumptions</summary><p>${escapeHTML(meta.regime)}</p><p>${escapeHTML(meta.rules)}</p><p>Scale: <code>${escapeHTML(meta.metric)}</code>; parameter <code>${escapeHTML(meta.parameter)}</code>.</p></details><a href="${escapeHTML(root)}lists/${encodeURIComponent(meta.id)}/index.html">View list</a> <span class="muted">· ${meta.historyCount} strict improvements${meta.otherResultCount?` · ${meta.otherResultCount} other results`: ''}</span>${meta.historyCount?'':'<p>No comparable numerical history has been recorded for this category.</p>'}</section>`;}).join('')}</div>`;
}

async function startExplorer(){
 const host=document.querySelector('[data-history-explorer]');if(!host)return;
 const bootstrap=JSON.parse(document.getElementById('history-bootstrap').textContent),siteRoot=new URL(document.documentElement.dataset.siteRoot||'../',document.baseURI);
 const state={series:bootstrap.series.map((s,i)=>({...s,visible:true,colorIndex:i})),from:bootstrap.initialFrom||'',until:'',problem:bootstrap.initialProblem,page:0,categoryRows:[],problemDescriptor:null,activeRequest:0,pendingAdd:false,rangeRequest:0,urlRequest:0,restoring:false,pendingRange:false,showOthers:true};
 const byId=id=>document.getElementById(id),status=byId('history-status'),plots=byId('history-plots'),legend=byId('history-legend'),problemSelect=byId('history-problem'),categorySelect=byId('history-category'),loadMore=byId('history-more'),add=byId('history-add'),fromInput=byId('history-from'),untilInput=byId('history-until'),showOthersInput=byId('history-show-others');
 const cache=new Map();
 const message=(text,error=false)=>{status.textContent=text;status.classList.toggle('is-error',error);};
 function syncRangeControls(){for(const control of [fromInput,untilInput,showOthersInput,...byId('history-range').querySelectorAll('button')])control.disabled=state.restoring||state.pendingAdd;}
 function busy(value){state.restoring=value;host.setAttribute('aria-busy',String(value));for(const control of host.querySelectorAll('select,input,button'))control.disabled=value;if(!value){refreshOptions();syncRangeControls();}}
 async function getJSON(file){
  if(!/^data\/history-explorer\/[A-Za-z0-9/_\-.]+\.json$/.test(file)||file.includes('..'))throw Error('Invalid static history path.');
  if(cache.has(file))return cache.get(file);
  const promise=fetch(new URL(file,siteRoot),{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('History data could not be loaded. Reload this page if the collection has just been updated.');return response.json().then(value=>{if(!Array.isArray(value)&&value.revision!==bootstrap.revision)throw Error('The collection has been updated. Reload this page to compare histories from the same release.');return value;});});
  cache.set(file,promise);if(cache.size>32)cache.delete(cache.keys().next().value);
  try{return await promise}catch(error){cache.delete(file);throw error}
 }
 function chosenFromURL(){const params=new URLSearchParams(location.search),raw=params.get('categories');if(raw===null)return null;if(raw.length>1500)throw Error('This comparison link contains too many category identifiers.');const ids=raw?raw.split(','):[];if(ids.some(id=>!safeId.test(id))||ids.length>MAX_SERIES)throw Error('This comparison link contains an invalid category selection.');return [...new Set(ids.map(id=>resolveCategoryId(id,bootstrap.categoryAliases)))];}
 function updateURL(push=false){const url=new URL(location.href);url.search='';url.searchParams.set('categories',state.series.map(s=>s.meta.id).join(','));if(state.from)url.searchParams.set('from',state.from);if(state.until)url.searchParams.set('until',state.until);if(!state.showOthers)url.searchParams.set('results','records');const hidden=state.series.filter(s=>s.visible===false).map(s=>s.meta.id);if(hidden.length)url.searchParams.set('hidden',hidden.join(','));if(url.href!==location.href){if(push)history.pushState(null,'',url);else history.replaceState(null,'',url);}byId('history-share').href=url.href;}
 function render(push=false){
  const options={from:state.from,until:state.until,showOthers:state.showOthers,updatedAt:bootstrap.updatedAt,root:document.documentElement.dataset.siteRoot||'../'};
  plots.innerHTML=renderHistoryGroups(state.series,options);legend.innerHTML=renderHistoryLegend(state.series,{root:options.root,interactive:true});
  byId('history-scale-note').hidden=groupSeries(state.series).length<2;
  fromInput.value=state.from;untilInput.value=state.until;showOthersInput.checked=state.showOthers;add.disabled=state.pendingAdd||state.pendingRange||state.series.length>=MAX_SERIES||!categorySelect.value;
  refreshOptions();if(state.restoring)for(const control of host.querySelectorAll('select,input,button'))control.disabled=true;updateURL(push);
 }
 async function loadSeries(id,{from=state.from,until=state.until||bootstrap.updatedAt,showOthers=state.showOthers}={}){
  const existing=state.series.find(s=>s.meta.id===id),pointsCovered=existing&&(existing.complete||from&&existing.loadedFrom&&from>=existing.loadedFrom);
  const eventsCovered=existing&&existing.eventsComplete!==false&&typeof existing.eventsFrom==='string'&&(!existing.eventsFrom||from&&from>=existing.eventsFrom)&&existing.eventsUntil>=until;
  if(pointsCovered&&(!showOthers||eventsCovered))return existing;
  const descriptor=await getJSON(`data/history-explorer/categories/${id}.json`);
  if(descriptor.meta?.id!==id||!Array.isArray(descriptor.pages)||!Array.isArray(descriptor.eventPages))throw Error('Invalid history descriptor.');
  async function readPages(pages){const rows=[];for(let at=0;at<pages.length;at+=4){const bodies=await Promise.all(pages.slice(at,at+4).map(page=>getJSON(page.path)));for(const body of bodies)rows.push(...body);}if(rows.some(p=>!safeId.test(p.id)||!validDate(p.date)||!Number.isFinite(p.coefficient)||p.coefficient<0))throw Error('Invalid numerical history data.');return rows;}
  const points=pointsCovered?existing.points:await readPages(descriptor.pages);
  const otherPoints=showOthers?(eventsCovered?existing.otherPoints:clipEvents(await readPages(eventPagesForRange(descriptor.eventPages,from,until)),from,until)):(existing?.otherPoints||[]);
  return {meta:descriptor.meta,points,complete:pointsCovered?existing.complete:true,loadedFrom:pointsCovered?existing.loadedFrom:null,otherPoints,eventsComplete:showOthers?true:existing?.eventsComplete??false,eventsFrom:showOthers?from:existing?.eventsFrom,eventsUntil:showOthers?until:existing?.eventsUntil,otherTotal:otherPoints.length};
 }
 function refreshOptions(){const previous=categorySelect.value;categorySelect.replaceChildren();for(const row of state.categoryRows){const option=document.createElement('option'),selected=state.series.some(s=>s.meta.id===row.id);option.value=row.id;option.disabled=selected;option.textContent=`${row.name} (${row.historyCount} improvements)${selected?' — selected':''}`;categorySelect.append(option);}const available=[...categorySelect.options].filter(option=>!option.disabled);categorySelect.value=available.some(option=>option.value===previous)?previous:(available[0]?.value||'');add.disabled=state.restoring||state.pendingAdd||state.pendingRange||state.series.length>=MAX_SERIES||!categorySelect.value;loadMore.hidden=!state.problemDescriptor||state.page>=state.problemDescriptor.pages.length;}
 async function categoryPage(){const descriptor=state.problemDescriptor;if(!descriptor||state.page>=descriptor.pages.length)return;const page=state.page,next=await getJSON(descriptor.pages[page].path);if(descriptor!==state.problemDescriptor||page!==state.page)return;state.categoryRows.push(...next);state.page++;refreshOptions();}
 async function setProblem(id){const request=++state.activeRequest;state.problem=id;state.categoryRows=[];state.problemDescriptor=null;state.page=0;refreshOptions();message('Loading categories…');const descriptor=await getJSON(`data/history-explorer/problems/${id}.json`);if(request!==state.activeRequest)return;state.problemDescriptor=descriptor;await categoryPage();message('');}
 async function applyRange(){
  if(state.pendingAdd||state.restoring){fromInput.value=state.from;untilInput.value=state.until;showOthersInput.checked=state.showOthers;return;}
  const request=++state.rangeRequest,from=fromInput.value,until=untilInput.value,showOthers=showOthersInput.checked;rangeForSeries(state.series,{from,until,updatedAt:bootstrap.updatedAt});
  message('Loading selected histories…');state.pendingRange=true;add.disabled=true;
  try{const completed=await Promise.all(state.series.map(async entry=>({...await loadSeries(entry.meta.id,{from,until:until||bootstrap.updatedAt,showOthers}),visible:entry.visible,colorIndex:entry.colorIndex})));
  if(request!==state.rangeRequest)return;const byId=new Map(completed.map(s=>[s.meta.id,s]));state.series=state.series.map(s=>byId.has(s.meta.id)?{...byId.get(s.meta.id),visible:s.visible,colorIndex:s.colorIndex}:s);state.from=from;state.until=until;state.showOthers=showOthers;render(true);message('');}finally{if(request===state.rangeRequest){state.pendingRange=false;refreshOptions();}}
 }
 for(const control of document.querySelectorAll('[data-history-controls]'))control.hidden=false;
 for(const problem of bootstrap.problems){const option=document.createElement('option');option.value=problem.id;option.textContent=`${problem.family} / ${problem.acronym}`;problemSelect.append(option);}problemSelect.value=state.problem;
 untilInput.max=bootstrap.updatedAt;fromInput.max=bootstrap.updatedAt;
 add.addEventListener('click',async()=>{if(state.restoring||state.pendingAdd||state.pendingRange)return;const id=categorySelect.value,urlRequest=state.urlRequest;if(!id||state.series.some(s=>s.meta.id===id))return message('That category is already selected.');if(state.series.length>=MAX_SERIES)return message(`Choose at most ${MAX_SERIES} categories.`);state.pendingAdd=true;add.disabled=true;syncRangeControls();message('Loading selected history…');try{const entry=await loadSeries(id);if(urlRequest!==state.urlRequest)return;const used=new Set(state.series.map(s=>s.colorIndex));let colorIndex=0;while(used.has(colorIndex))colorIndex++;state.series.push({...entry,visible:true,colorIndex});render(true);message('');}catch(error){message(error.message,true)}finally{state.pendingAdd=false;syncRangeControls();add.disabled=state.restoring||state.pendingRange||state.series.length>=MAX_SERIES||!categorySelect.value;}});
 categorySelect.addEventListener('change',()=>{add.disabled=state.restoring||state.pendingAdd||state.pendingRange||state.series.length>=MAX_SERIES||!categorySelect.value;});
 problemSelect.addEventListener('change',()=>setProblem(problemSelect.value).catch(error=>message(error.message,true)));loadMore.addEventListener('click',()=>categoryPage().catch(error=>message(error.message,true)));
 legend.addEventListener('change',event=>{const id=event.target.dataset.historyVisible;if(!id)return;const entry=state.series.find(s=>s.meta.id===id);if(entry){entry.visible=event.target.checked;render(true);}});
 legend.addEventListener('click',event=>{const button=event.target.closest('[data-history-remove]');if(!button)return;state.series=state.series.filter(s=>s.meta.id!==button.dataset.historyRemove);render(true);message('');});
 showOthersInput.addEventListener('change',()=>applyRange().catch(error=>{showOthersInput.checked=state.showOthers;message(error.message,true);}));
 byId('history-range').addEventListener('submit',event=>{event.preventDefault();applyRange().catch(error=>message(error.message,true));});
 for(const preset of document.querySelectorAll('[data-history-years]'))preset.addEventListener('click',()=>{const years=Number(preset.dataset.historyYears);untilInput.value='';if(years){const date=new Date(bootstrap.updatedAt);date.setUTCFullYear(date.getUTCFullYear()-years);fromInput.value=date.toISOString().slice(0,10);}else fromInput.value='';applyRange().catch(error=>message(error.message,true));});
 async function restoreURL(){
  const request=++state.urlRequest;state.rangeRequest++;state.pendingRange=false;busy(true);let restoreError;
  try{
   const ids=chosenFromURL(),params=new URLSearchParams(location.search),requestedFrom=params.get('from')||'',requestedUntil=params.get('until')||'',hiddenRaw=params.get('hidden')||'',showOthers=params.get('results')!=='records';
   if(hiddenRaw.length>1500||hiddenRaw.split(',').filter(Boolean).some(id=>!safeId.test(id)))throw Error('This comparison link contains an invalid visibility selection.');
   const hidden=new Set(hiddenRaw.split(',').filter(Boolean).map(id=>resolveCategoryId(id,bootstrap.categoryAliases)));
   const from=params.has('from')?requestedFrom:(ids===null?bootstrap.initialFrom||'':''),until=requestedUntil;
   rangeForSeries([],{from,until,updatedAt:bootstrap.updatedAt});
   const selectedIds=ids===null?bootstrap.series.map(entry=>entry.meta.id):ids;message('Loading selected histories…');
   const next=await Promise.all(selectedIds.map(async(id,i)=>({...await loadSeries(id,{from,until:until||bootstrap.updatedAt,showOthers}),visible:!hidden.has(id),colorIndex:i})));
   if(request!==state.urlRequest)return;
   state.series=next;state.from=from;state.until=until;state.showOthers=showOthers;state.problem=next[0]?.meta.problemId||bootstrap.initialProblem;problemSelect.value=state.problem;render();message('');
  }catch(error){if(request!==state.urlRequest)return;state.series=[];plots.innerHTML='<p class="history-empty">Choose categories to create a comparison.</p>';legend.replaceChildren();restoreError=error;message(error.message,true);}
  try{await setProblem(state.problem);}catch(error){restoreError=restoreError||error;}
  finally{if(request===state.urlRequest){busy(false);if(restoreError)message(restoreError.message,true);}}
 }
 window.addEventListener('popstate',()=>restoreURL().catch(error=>message(error.message,true)));
 await restoreURL();
}
if(typeof document!=='undefined')startExplorer().catch(error=>{const status=document.getElementById('history-status');if(status){status.textContent=error.message;status.classList.add('is-error');}});
