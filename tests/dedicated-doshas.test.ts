import assert from "node:assert/strict";
import { computeChart, currentTransits, siderealLon, type BirthInput } from "../src/lib/astro/calc";
import { detectDoshas } from "../src/lib/astro/yogas";
import { houseFrom, planet } from "../src/lib/astro/analysis";
import { buildKaalSarpReport, buildMangalReport, buildSadeSatiReport } from "../src/lib/dedicated-doshas/report";
import { BirthInputError, validateBirthDetails } from "../src/lib/calculators/birth";

const base: BirthInput={name:"Dedicated Test",gender:"male",date:"2001-08-31",time:"15:04",place:"Nellore",lat:14.4499,lon:79.987,tz:"Asia/Kolkata",style:"north"};
const now=Date.UTC(2026,9,6),transits=currentTransits(),chart=computeChart(base);

/* KAAL SARP */
const ks=buildKaalSarpReport(chart,now), shared=detectDoshas(chart,undefined,now).find(d=>d.name==="Kaal Sarp Dosha")!;
assert.equal(ks.present,shared.present);assert.equal(ks.sharedResult.details,shared.details);assert.equal(ks.sequence.length,7);assert.equal(ks.typeNumber,planet(chart,"Rahu").house);assert.equal(ks.typeName,["Anant","Kulik","Vasuki","Shankhpal","Padma","Mahapadma","Takshak","Karkotak","Shankhachood","Ghatak","Vishdhar","Sheshnag"][ks.typeNumber-1]);
const rah=planet(chart,"Rahu").lon;for(const p of ks.sequence){const actual=((planet(chart,p.id).lon-rah+360)%360);assert.ok(Math.abs(p.offsetFromRahu-actual)<.001);assert.ok(p.distanceToNearestNode>=0&&p.distanceToNearestNode<=90);}
assert.equal(ks.enclosedCount,Math.max(ks.sequence.filter(p=>p.offsetFromRahu>0&&p.offsetFromRahu<180).length,ks.sequence.filter(p=>!(p.offsetFromRahu>0&&p.offsetFromRahu<180)).length));
assert.ok(ks.notes.some(n=>/mean nodes/i.test(n))&&ks.notes.some(n=>/no universally accepted cancellation/i.test(n)));
console.log(`PASS Kaal Sarp agrees with shared engine: present=${ks.present}, enclosed=${ks.enclosedCount}/7, type=${ks.typeName}`);

// Find a real active Kaal Sarp chart to exercise that branch.
let fullFound=false;
for(let day=0;day<365*8&&!fullFound;day+=5){const d=new Date(Date.UTC(1980,0,1+day));const c=computeChart({...base,name:"Kaal Case",date:d.toISOString().slice(0,10),time:"12:00"});const r=buildKaalSarpReport(c,now);if(!r.present)continue;assert.equal(r.enclosedCount,7);assert.equal(r.outside.length,0);assert.ok(r.remedies.length>0);assert.equal(r.sharedResult.present,true);console.log(`PASS active Kaal Sarp case: born ${c.input.date}, ${r.typeName} type, axis H${r.rahuHouse}/H${r.ketuHouse}`);fullFound=true;}
assert.ok(fullFound,"active Kaal Sarp branch was not tested");

/* MANGAL */
const mg=buildMangalReport(chart,now), sharedM=detectDoshas(chart,undefined,now).find(d=>d.name.startsWith("Mangal"))!;
assert.equal(mg.present,sharedM.present);assert.equal(mg.severity,sharedM.severity);assert.equal(mg.references.length,3);const mars=planet(chart,"Mars");assert.deepEqual(mg.references.map(r=>r.house),[mars.house,houseFrom(planet(chart,"Moon").sign,mars.sign),houseFrom(planet(chart,"Venus").sign,mars.sign)]);assert.deepEqual(mg.references.map(r=>r.manglik),mg.references.map(r=>[1,2,4,7,8,12].includes(r.house)));assert.equal(mg.mars.navamsaHouse,houseFrom(chart.asc.d9,mars.d9));assert.ok(mg.score>=0&&mg.score<=100);assert.equal(mg.cancellations.length>0,/Cancelled \/ reduced/i.test(sharedM.details));assert.ok(mg.notes.some(n=>/omit the 2nd/i.test(n))&&mg.notes.some(n=>/age 28/i.test(n)));
console.log(`PASS Mangal agrees with engine: ${mg.references.filter(r=>r.manglik).length}/3 hits, severity=${mg.severity}, cancellations=${mg.cancellations.length}`);

/* SADE SATI */
const sade=buildSadeSatiReport(chart,transits,now), engineSade=detectDoshas(chart,transits,now).find(d=>d.name.startsWith("Shani Sade"))!;const satSign=Math.floor(transits.Saturn/30),satHouse=houseFrom(planet(chart,"Moon").sign,satSign);
assert.equal(sade.active,[12,1,2].includes(satHouse));assert.equal(sade.sharedResult.present,engineSade.present);assert.equal(sade.currentSaturn.houseFromMoon,satHouse);assert.equal(sade.dhaiya.active,[4,8].includes(satHouse));assert.equal(sade.natalSaturn.house,planet(chart,"Saturn").house);assert.ok(sade.phases.length>0);
for(const p of sade.phases){const a=Date.parse(p.start),b=Date.parse(p.end),years=(b-a)/(365.25*86400000);assert.ok(years>1.5&&years<4);assert.equal(Math.floor(siderealLon("Saturn",new Date((a+b)/2))/30),["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].indexOf(p.sign));}
assert.ok(sade.notes.some(n=>/not automatically/i.test(n))&&sade.notes.some(n=>/Dhaiya/i.test(n)));
console.log(`PASS Sade Sati agrees with live Saturn: active=${sade.active}, house from Moon=${satHouse}, ${sade.phases.length} dated phases`);

// Find active Sade Sati branch.
let active=false;
for(let day=0;day<32&&!active;day++){const d=new Date(Date.UTC(1992,0,1+day));const c=computeChart({...base,name:"Sade Case",date:d.toISOString().slice(0,10),time:"12:00"});const r=buildSadeSatiReport(c,transits,now);if(!r.active)continue;assert.ok(r.phase&&r.phase.status==="current");assert.ok(Date.parse(r.phase.start)<=now&&Date.parse(r.phase.end)>now);assert.equal(r.sharedResult.present,true);console.log(`PASS active Sade Sati case: born ${c.input.date}, ${r.phase.phase}, ends ${r.phase.end.slice(0,10)}`);active=true;}
assert.ok(active);

const reject=(patch:Record<string,unknown>,pat:RegExp)=>assert.throws(()=>validateBirthDetails({...base,...patch},"Birth details","north"),(e:unknown)=>e instanceof BirthInputError&&pat.test(e.message));reject({date:"2001-02-30"},/does not exist/);reject({time:"15:04:30"},/HH:MM/);reject({lat:90},/latitude/);reject({tz:"Bad/Zone"},/invalid time zone/);
console.log("PASS invalid birth details rejected for all three dedicated calculators");
console.log("All dedicated Kaal Sarp, Mangal and Sade Sati checks passed.");
