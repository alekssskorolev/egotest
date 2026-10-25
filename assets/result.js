function renderResultDescription(){
 const title=document.getElementById('result-title');const copy=document.getElementById('result-copy');
 const id=Number(new URLSearchParams(location.hash.slice(1)).get('type'));
 const t=Object.values(EGO_TYPES).find(t=>t.id===id);
 if(t&&window.EGO_FULL_DESCRIPTIONS[id]){title.textContent=t.name;copy.innerHTML=window.EGO_FULL_DESCRIPTIONS[id];}
 else {title.textContent='Выбери описание после теста';copy.textContent='В ссылке нет подходящего номера модели. Можно вернуться к тесту и открыть описание из результата.';}
}
document.addEventListener('DOMContentLoaded',renderResultDescription);
window.addEventListener('hashchange',renderResultDescription);
