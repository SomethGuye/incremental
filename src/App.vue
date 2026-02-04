<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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
		E(10),E(1e3),E(1e7),E(1e11),
	],
	adics: [ // initial costs
		null,
		E(1),E(100),E(1e5),E(1e7),
	],
	tick: E(0), // amount of theorems
	prestige: {
		points: E(0),
		times: E(0),
		upgs: [
			null,
			false,false,
			false,false,
			false,false,
			false,false,
		]
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
	setInterval(gameTick, dTime * 1000);
	saveloop = setInterval(()=>{
		saveGame();
	}, 15_000);
	}
);

function gameTick(t=dTime){
	g.a      = g.a     .plus(persec(0).mul(t));
	g.ads[1] = g.ads[1].plus(persec(1).mul(t));
	g.ads[2] = g.ads[2].plus(persec(2).mul(t));
	g.ads[3] = g.ads[3].plus(persec(3).mul(t));
}
function loadGame(){
	let q = JSON.parse(atob(localStorage.getItem("save")));
	g.a = F(q.a);
	g.tick = F(q.tick)
	for (let i = 1; i <= 4; i++) g.ads[i] = F(q.ads[i]);
	for (let i = 1; i <= 4; i++) g.adps[i] = F(q.adps[i]);
	g.not = q.not;
}
function saveGame(){
	return localStorage.setItem("save", btoa(JSON.stringify(g)));
}
const baseMPS = computed(()=>{
	let tickmul = g.tick.mul(0.25).plus(2);
	return g.ads[1].mul(tickmul.pow(g.adps[1])).div(8);
})
function persec(n) {
	let tickmul = g.tick.mul(0.25).plus(2);
	let base = g.ads[n+1].mul(tickmul.pow(g.adps[n+1])).div(n===0?1:8);
	if(n !== 0) return base;
	if(base.gt(1e20))
		base = base.pow(
			(E(20).div(base.log10())).pow(0.5)
		);
	return base;
}
function dimcost(n, q=g.adps[n]){
	return g.adcms[n].pow(q).mul(g.adics[n]);
}
function tickcost(q=g.tick){
	return E(10).pow(q.pow(1.3).mul(2).floor()).mul(100);
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
function pendingPoints(){
	if(!g.prestige.upgs[8]) return 1;
	else return g.tick.sub(5)
}
function prestige(){
	g.prestige.points = g.prestige.points.add(g.tick.sub(5));
	g.prestige.times = g.prestige.times.add(1);
	g.a = E(1);
	g.tick = E(0)
	for (let i = 1; i <= 4; i++) g.ads[i] = E(0);
	for (let i = 1; i <= 4; i++) g.adps[i] = E(0);
}
function buyPUpgrade(n){
	if(( g.prestige.upgs[n-2] || n <= 2 )&&( n !== 8 || g.prestige.upgs.findIndex((x)=>!x) === 7)) {
		g.prestige.upgs[n] = true; // Truth nuke
		g.prestige.points = g.prestige.points.sub(Math.floor(n/2+1))
	}
}
function scinot(x, p){
	return x.toPrecision(p).replace('+', '')
}
function notate(x, p=2){
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
			<div v-if="g.prestige.times > 0">You have <span style="color: #00f;">{{ notate(g.prestige.points) }}</span> prestige points.</div>
			<br />
			<div>
				<button @click="tab = 'dim'" style="background-color: #933;">Structures</button>
				<button @click="tab = 'opt'" style="background-color: #ccc;">Options</button>
				<button @click="tab = 'pre'" style="background-color: #33f;">Prestige</button>
			</div>
			<button v-if="g.tick.gt(6)" @click='prestige' style="background-color: blue;">Prestige for {{ notate(pendingPoints()) }} point{{pendingPoints!==1?'s':''}}!</button>
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
			<div v-if="baseMPS.gt(1e20)">
				Above 1e20 manifolds per second, manifold production is raised to the power of {{ notate((E(20).div(baseMPS.log10())).pow(0.5), 4) }}
			</div>
		</div>
		<br /> 
		<div v-if="tab==='opt'">
			<div class="center">
				<table>
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
				{{ JSON.stringify(g,1) }}
			</div>
		</div>
		<br />
		<div v-if="tab==='pre'">
			You have <span style="color: #00f">{{ g.prestige.points }}</span> prestige points.
			<br />
			Each upgrade costs 1 prestige point.
			<br />
			By the way this is not yet implemented :(
			<table>
				<tr>
					<td>
						<button :disabled="true" @click="buyPUpgrade(1)">Upgrade 1: Double all generator mults</button>
					</td>
					<td>
						<button :disabled="true" @click="buyPUpgrade(2)">Upgrade 2: Weaken manifold softcap by 5% (50% =&gt; 45%)</button>
					</td>
				</tr>
				<tr>
					<td>
						<button :disabled="!g.prestige.upgs[1]" @click="buyPUpgrade(3)">Upgrade 3: Double all generator mults</button>
					</td>
					<td>
						<button :disabled="!g.prestige.upgs[2]" @click="buyPUpgrade(4)">Upgrade 4: Weaken manifold softcap by 5% (50% =&gt; 45%)</button>
					</td>
				</tr>
				<tr>
					<td>
						<button :disabled="!g.prestige.upgs[3]" @click="buyPUpgrade(5)">Upgrade 5: Double all generator mults</button>
					</td>
					<td>
						<button :disabled="!g.prestige.upgs[4]" @click="buyPUpgrade(6)">Upgrade 6: Weaken manifold softcap by 5% (50% =&gt; 45%)</button>
					</td>
				</tr>
				<tr>
					<td>
						<button :disabled="!g.prestige.upgs[5]" @click="buyPUpgrade(7)">Upgrade 7: Start with some manifolds after prestige</button>
					</td>
					<td>
						<button :disabled="!g.prestige.upgs[6]" @click="buyPUpgrade(8)">Upgrade 8: You can get more than 1 prestige point per reset</button>
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>