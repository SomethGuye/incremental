<script setup>
import { ref, reactive, onMounted } from 'vue'
import Decimal from './break_eternity.min.js'
let D = Decimal;
let E = D.fromNumber;
let F = D.fromString;
const g = reactive({
	a: E(1), // amount of manifolds
	ads: [ // amount of producers
		null,
		E(0),E(0),E(0),E(0),
	],
	adps: [ // amount of purchased producers
		null,
		E(0),E(0),E(0),E(0),
	],
	adcms: [ // cost multipliers
		null,
		E(10),E(1e3),E(1e5),E(1e8),
	],
	adics: [ // initial costs
		null,
		E(1),E(1e3),E(1e4),E(1e6),
	],
	tick: E(0), // amount of theorems
	prestige: {
		points: E(0),
		times: E(0)
	},
	notation: 'sci',
});
const tab = ref("dim");
let saveloop;
const dTime = 62.5 / 1000;
onMounted(()=>{
	if(!localStorage.getItem("save")){
		saveGame();
	} else {
		loadGame();
	}
	setInterval(()=>{
		g.a      = g.a     .plus(persec(0).mul(dTime));
		g.ads[1] = g.ads[1].plus(persec(1).mul(dTime));
		g.ads[2] = g.ads[2].plus(persec(2).mul(dTime));
		g.ads[3] = g.ads[3].plus(persec(3).mul(dTime));
	}, dTime * 1000);
	saveloop = setInterval(()=>{
		saveGame();
	}, 15_000);
	}
);
function loadGame(){
	let q = JSON.parse(atob(localStorage.getItem("save")));
	g.a = F(q.a);
	g.tick = F(q.tick)
	for (let i = 1; i <= 4; i++) g.ads[i] = F(q.ads[i]);
	for (let i = 1; i <= 4; i++) g.adps[i] = F(q.adps[i]);
	for (let i = 1; i <= 4; i++) g.adcms[i] = F(q.adcms[i]);
	for (let i = 1; i <= 4; i++) g.adics[i] = F(q.adics[i]);
	g.not = q.not;
}
function saveGame(){
	return localStorage.setItem("save", btoa(JSON.stringify(g)));
}
function persec(n) {
	let tickmul = g.tick.mul(0.25).plus(2);
	let base = g.ads[n+1].mul(tickmul.pow(g.adps[n+1]));
	if(n !== 0) return base;
	if(g.a.gt(1e20))
		base = base.pow(
			(E(20).div(g.a.log10())).pow( // base softcap
				g.a.gt(1e50)?g.a.log10().sub(50):E(1) //second softcap (powers first)
			)
		);
	return base;
}
function dimcost(n, q=g.adps[n]){
	return g.adcms[n].pow(q).mul(g.adics[n]);
}
function tickcost(q=g.tick){
	return E(10).pow(q.pow(1.1).mul(2).floor()).mul(100);
}
function delSave(){
	localStorage.removeItem("save");
	clearInterval(saveloop);
	location.reload();
}

function buyad(n) {
	let cost = dimcost(n);
	if (g.a.gte(cost)) {
		g.a = g.a.sub(cost);
		g.adps[n] = g.adps[n].plus(1);
		g.ads[n] = g.ads[n].plus(1);
		return true;
	}
	return false;
}
function buytick() {
	let cost = tickcost();
	if (g.a.gte(cost)) {
		g.a = g.a.sub(cost);
		g.tick = g.tick.plus(1);
		return true;
	}
	return false;
}
function scinot(x, p){
	return x.toPrecision(p)
}
function notate(x, p=3){
	if (g.notation=='sci') return scinot(x,p+1)
	else return 'no notation'
}
</script>
<style>
	* {
		background-color: #222;
		color: #fff;
		font-family: monospace;
	}
	button {
		border-style: solid;
		border-radius: 8px;
		border-color: #333;
		background-color: #fff;
		color: #000;
	}
	table, td {
		border: none;
	}
	td > button {
		width: 100%;
		text-align: left;
	}
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.stack {
		flex-direction: column;
	}
	h1 {
		font-size: 56px;
	}
	div *:not(h1) {
		font-size: 24px;
	}
	
</style>
<template>
	<div>
		<div class="center stack">
			<h1>You have <span style="color: #f00; font-size:72px;">{{ notate(g.a) }}</span> manifolds. (+{{notate(persec(0))}}/s)</h1>
			<br />
			<div>
				<button @click="tab = 'dim'" style="background-color: #933;">Structures</button>
				<button @click="tab = 'opt'" style="background-color: #ccc;">Options</button>
			</div>
		</div>
		<div v-if="tab==='dim'">
			<div class="center">
				<button @click="buytick" style = "background-color: #cfc;">
					Cost: {{notate(tickcost())}}
				</button>
				<pre> </pre>
				You have {{notate(g.tick)}} theorem{{ g.tick.neq(1)?'s':'' }}<span v-if="g.tick.gt(0)">, making per-purchase multipliers {{notate(g.tick.mul(0.25).plus(2), 2)}}</span>
			</div>
			<br />
			<table>
				<tr>
					<td>
						<button @click="buyad(1)">
							Cost: {{notate(dimcost(1))}}
						</button>
					</td>
					<td>
						Points
					</td>
					<td>
						| You have {{notate(g.ads[1])}}
						<span v-if="g.ads[2]>0">({{notate(g.adps[1])}})</span>
					</td>
					<td>
						<span v-if="g.ads[2]>0">| (+{{notate(persec(1))}}/s)</span>
					</td>
				</tr>
				<tr v-if="g.adps[1]>0">
					<td>
						<button @click="buyad(2)">
							Cost: {{notate(dimcost(2))}}
						</button>
					</td>
					<td>
						Lines
					</td>
					<td>
						| You have {{notate(g.ads[2])}}
						<span v-if="g.ads[3]>0"> ({{notate(g.adps[2])}})</span>
					</td>
					<td>
						<span v-if="g.ads[3]>0">| (+{{notate(persec(2))}}/s)</span>
					</td>
				</tr>
				<tr v-if="g.adps[2]>0">
					<td>
						<button @click="buyad(3)">
							Cost: {{notate(dimcost(3))}}
						</button>
					</td>
					<td>
						Planes
					</td>
					<td>
						| You have {{notate(g.ads[3])}}
						<span v-if="g.ads[4]>0"> ({{notate(g.adps[3])}})</span>
					</td>
					<td>
						<span v-if="g.ads[4]>0">| (+{{notate(persec(3))}}/s)</span>
					</td>
				</tr>
				<tr v-if="g.adps[3]>0">
					<td>
						<button @click="buyad(4)">
							Cost: {{notate(dimcost(4))}}
						</button>
					</td>
					<td>Cells</td>
					<td>| You have {{notate(g.adps[4])}}</td>
				</tr>
			</table>
			<br />
			<div v-if="g.a.gt(1e20)">
				Above 1e20 manifolds, manifold production is raised to the power of {{ notate((E(20).div(g.a.log10())).pow((g.a.gt(1e50))?g.a.log10().sub(50):E(1)), 4) }}

			</div>
			<div v-if="g.a.gt(1e50)">
				Above 1e50 manifolds, manifold softcap is raised to the power of {{ notate(g.a.log10().sub(50)) }}

			</div>
		</div>
		<br /> 
		<div v-if="tab==='opt'">
			<table class="center">
				<tr>
					<td>
						<button @click="delSave" style="background-color: #f33;">
							Delete save
						</button>
					</td>
				</tr>
				<tr>
					<td>
						<button @click="saveGame">
							save game for debug
						</button>
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>