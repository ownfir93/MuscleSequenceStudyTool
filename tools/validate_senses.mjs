/** Dependency-free content contract checks. Run: node tools/validate_senses.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context=vm.createContext({window:{}});
for(const file of ['js/data.js','js/senses-data.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const data=context.window.DATA;
let lessons=0,cards=0,questions=0,sequences=0;
const nonempty=(value,label)=>assert(typeof value==='string' && value.trim(),label+' must be a nonempty string');
function question(q,label){
  for(const field of ['q','a','explanation','source'])nonempty(q[field],label+'.'+field);
  assert(q.options?.length>=2,label+' needs at least two choices');
  assert.equal(new Set(q.options).size,q.options.length,label+' has duplicate choices');
  assert.equal(q.options.filter(x=>x===q.a).length,1,label+' must contain its correct answer exactly once');
}
for(const id of ['vision','chemical','hearing','general']){
  const d=data[id];assert(d,id+' missing');assert.equal(d.course,'BIOL232');assert.equal(d.id,id);assert.equal(d.quizOnly,true);
  for(const collection of ['learn','cards','quizzes','sequences'])assert(d[collection]?.length,id+'.'+collection+' is empty');
  for(const [i,item] of d.learn.entries()){
    for(const field of ['lead','text','source'])nonempty(item[field],id+'.learn['+i+'].'+field);
    assert.equal((item.text.match(/\[\[/g)||[]).length,(item.text.match(/\]\]/g)||[]).length,id+' has unbalanced highlights');
  }
  for(const [i,c] of d.cards.entries())for(const field of ['front','back','source'])nonempty(c[field],id+'.cards['+i+'].'+field);
  for(const [i,q] of d.quizzes.entries())question(q,id+'.quizzes['+i+']');
  assert.equal(new Set(d.sequences.map(s=>s.id)).size,d.sequences.length,id+' has duplicate sequence IDs');
  for(const seq of d.sequences){assert(seq.steps.length>=2,id+'.'+seq.id+' needs ordered steps');nonempty(seq.source,id+'.'+seq.id+'.source');}
  lessons+=d.learn.length;cards+=d.cards.length;questions+=d.quizzes.length;sequences+=d.sequences.length;
  console.log(`${id}: ${d.learn.length} lessons, ${d.cards.length} cards, ${d.quizzes.length} questions, ${d.sequences.length} pathways`);
}
// Retain the original course data and assets; this file validates, never rewrites them.
for(const id of ['nervous','muscle','spinal','axial','limb'])assert(data[id],id+' legacy topic missing');
const {SENSES_LABS}=await import(path.join(root,'js/senses-lab.js'));
let labCount=0,labQuestions=0;
for(const [section,labs] of Object.entries(SENSES_LABS)){
  assert(labs.length>=2,section+' needs two labs');
  for(const lab of labs){
    const qs=lab.questions;assert(qs?.length,section+' lab has no questions');
    assert.equal(new Set(qs.map(q=>q.id)).size,qs.length,section+' lab has duplicate IDs');
    for(const [i,q]of qs.entries())question(q,section+'.lab['+labCount+'].q'+i);
    labCount++;labQuestions+=qs.length;
  }
}
console.log(`PASS: ${lessons} lessons, ${cards} flashcards, ${questions} curated questions, ${sequences} pathways, ${labCount} labs / ${labQuestions} lab questions.`);
