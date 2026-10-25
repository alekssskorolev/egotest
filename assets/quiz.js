// Original IDs, questions, random selection and scoring (3/1/0) are retained.
let currentQuestions=[],currentQuestionIndex=0,scores={},currentWinnerId=null,testMode='full';
let answerHistory=[],answerBusy=false,testStarting=false,chartInstance=null,answerTimer=null,rankedResults=[];
function initScores(){for(let i=1;i<=17;i++)scores[i]=0;}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function prepareQuestions(mode){initScores();const list=mode==='full'?[...RAW_QUESTIONS]:Array.from({length:17},(_,i)=>shuffleArray(RAW_QUESTIONS.filter(q=>q.type===i+1)).slice(0,3)).flat();currentQuestions=shuffleArray(list);currentQuestionIndex=0;answerHistory=[];answerBusy=false;}
function startTest(mode){
 if(testStarting)return;testStarting=true;testMode=mode==='express'?'express':'full';prepareQuestions(testMode);
 document.getElementById('warning-overlay').classList.add('active');
 setTimeout(()=>{testStarting=false;document.getElementById('warning-overlay').classList.remove('active');document.getElementById('home-page').classList.add('hidden');document.getElementById('test-privacy').classList.add('hidden');document.getElementById('results-page').classList.add('hidden');document.getElementById('quiz-page').classList.remove('hidden');document.getElementById('quiz-navigation').classList.remove('hidden');renderQuestion();trackReview('test_start');},450);
}
function renderQuestion(){
 const q=currentQuestions[currentQuestionIndex];if(!q){finishTest();return;}
 document.getElementById('question-counter').textContent=`${currentQuestionIndex+1} / ${currentQuestions.length}`;
 const text=document.getElementById('question-text');text.textContent=q.text;text.setAttribute('tabindex','-1');text.focus({preventScroll:true});
 document.getElementById('progress-fill').style.width=`${currentQuestionIndex/currentQuestions.length*100}%`;
 document.getElementById('previous-question').disabled=currentQuestionIndex===0;
 document.querySelectorAll('.btn-answer').forEach(b=>b.disabled=false);
 window.scrollTo({top:0,behavior:'instant'});
}
function handleAnswer(points){
 if(answerBusy||![0,1,3].includes(points)||!currentQuestions[currentQuestionIndex])return;
 answerBusy=true;document.querySelectorAll('.btn-answer').forEach(b=>b.disabled=true);answerHistory[currentQuestionIndex]=points;
 answerTimer=setTimeout(()=>{currentQuestionIndex++;answerBusy=false;if(currentQuestionIndex===currentQuestions.length)finishTest();else renderQuestion();},180);
}
function previousQuestion(){if(answerBusy||currentQuestionIndex===0)return;currentQuestionIndex--;renderQuestion();}
function exitTest(){if(!confirm('Выйти из теста? Ответы не сохранятся.'))return;clearTimeout(answerTimer);answerBusy=false;currentQuestions=[];answerHistory=[];scores={};currentWinnerId=null;document.getElementById('quiz-page').classList.add('hidden');document.getElementById('quiz-navigation').classList.add('hidden');document.getElementById('home-page').classList.remove('hidden');document.getElementById('test-privacy').classList.remove('hidden');trackReview('test_exit');window.scrollTo(0,0);}
function finishTest(){
 initScores();currentQuestions.forEach((q,i)=>{scores[q.type]+=answerHistory[i]||0;});
 rankedResults=Object.values(EGO_TYPES).map(t=>({...t,score:scores[t.id]})).sort((a,b)=>b.score-a.score||a.id-b.id);
 const highest=rankedResults[0].score;const tied=rankedResults.filter(t=>t.score===highest);const unique=highest>0&&tied.length===1;currentWinnerId=unique?tied[0].id:null;
 document.getElementById('quiz-page').classList.add('hidden');document.getElementById('quiz-navigation').classList.add('hidden');document.getElementById('results-page').classList.remove('hidden');
 document.getElementById('winner-name').textContent=highest===0?'Ни одна модель не выделилась':unique?tied[0].name:'Несколько равных результатов';
 const desc=document.getElementById('winner-description');
 if(unique)desc.innerHTML=SHORT_DESCRIPTIONS[currentWinnerId];
 else {desc.textContent=highest===0?'По твоим ответам утверждения не похожи на недавний опыт. Не нужно искать скрытую проблему или выбирать тип вопреки этому.':'Одинаковый балл набрали: '+tied.map(t=>t.name).join(', ')+'. Порядок при равенстве технический и не означает, что одна модель выражена сильнее.';}
 const old=document.getElementById('all-scores');if(old)old.remove();
 const details=document.createElement('details');details.id='all-scores';details.className='result-all';const summary=document.createElement('summary');summary.textContent='Все баллы и как читать результат';details.append(summary);
 const note=document.createElement('p');const max=testMode==='full'?18:9;note.textContent=`За ответ «да» — 3 балла, «иногда» — 1, «нет» — 0. Максимум по одной модели — ${max}. Это сумма ответов, не процент твоей личности. Баллы разных вариантов теста напрямую не сравнивают.`;details.append(note);
 const ul=document.createElement('ul');rankedResults.forEach(t=>{const li=document.createElement('li');li.textContent=`${t.name}: ${t.score} из ${max}. `;if(highest>0){const a=document.createElement('a');a.href='result.html#type='+t.id;a.textContent='Описание';li.append(a);}ul.append(li);});details.append(ul);document.getElementById('winner-description').parentElement.after(details);
 drawChart(rankedResults.slice(0,3));renderLegend(rankedResults.slice(0,3));
 const btn=document.querySelector('.btn-cta');const fallback=document.getElementById('fallback-link');
 btn.href='https://t.me/aleksskorolev_bot?start='+(unique?BOT_KEYS[currentWinnerId]:'egotest');
 fallback.href=unique?'result.html#type='+currentWinnerId:'result.html';
 const cta=btn.parentElement;cta.style.display=highest===0?'none':'';document.querySelector('.cta-text').style.display=highest===0?'none':'';
 document.getElementById('long-text-block').classList.add('hidden');
 trackReview('test_complete');window.scrollTo(0,0);
}
function drawChart(top3){
 const canvas=document.getElementById('resultsChart');if(typeof Chart==='undefined'){canvas.hidden=true;return;}canvas.hidden=false;
 if(chartInstance)chartInstance.destroy();
 chartInstance=new Chart(canvas.getContext('2d'),{type:'doughnut',data:{labels:top3.map(i=>i.name),datasets:[{data:top3.map(i=>i.score),backgroundColor:['#0066FF','#0044AA','#002255'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false},tooltip:{enabled:false}}}});
}
function renderLegend(top3){
 const parent=document.getElementById('chart-legend');parent.replaceChildren();const h=document.createElement('p');h.style.cssText='font-weight:700;color:#718096;font-size:13px;';h.textContent='Три строки с наибольшими баллами';parent.append(h);
 const colors=['#0066FF','#0044AA','#002255'];const max=testMode==='full'?18:9;
 top3.forEach((t,i)=>{const row=document.createElement('div');row.className='legend-item';const color=document.createElement('div');color.className='legend-color';color.style.backgroundColor=colors[i];const text=document.createElement('div');text.className='legend-text';const name=document.createElement('span');name.textContent=t.name;const score=document.createElement('span');score.className='legend-score';score.textContent=t.score+' / '+max+' б.';text.append(name,score);row.append(color,text);parent.append(row);});
 const note=document.createElement('p');note.className='copy-note';note.textContent='Круг показывает соотношение баллов этих трёх строк, не доли личности. При равенстве смотри полный список ниже.';parent.append(note);
}
