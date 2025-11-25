import { UpgradeCard, UpgradeType } from "./components.js";

export const upgradeCards: Partial<UpgradeCard>[] = [
{stage: 1,	name: 'Sapphire Cooler',	type: UpgradeType.cooling,	effect: '⬜ → 🟫 ⭐',	cost: 2},
{stage: 1,	name: 'GaN Cooler',	type: UpgradeType.cooling,	effect: '🟦 → 🟧 ⭐',	cost: 2},
{stage: 1,	name: 'Early Vent',	type: UpgradeType.exhaust,	effect: '🟧 → ⭐',	cost: 2},
{stage: 1,	name: 'Sapphire Exhaust',	type: UpgradeType.exhaust,	effect: '⬜ → ⭐',	cost: 2},
{stage: 1,	name: 'Primary Heater',	type: UpgradeType.heater,	effect: '⬜ 🟧 → 🟦 ✳️',	cost: 4},
{stage: 1,	name: 'Startup Injection',	type: UpgradeType.injection,	effect: '✳️ → 🟫 🟧',	cost: 4},
{stage: 1,	name: 'Precursor Injection',	type: UpgradeType.injection,	effect: '✳️ → ⬜ 🟧',	cost: 4},
{stage: 1,	name: 'Two-Flow Nozzle',	type: UpgradeType.nozzle,	effect: '🟦 → 🟦 🟦',	cost: 4},
{stage: 1,	name: 'ZnSe Nozzle',	type: UpgradeType.nozzle,	effect: '🟧 → 🟧 🟧',	cost: 2},
{stage: 1,	name: 'Vacuum Nozzle',	type: UpgradeType.nozzle,	effect: '🟫 → 🟫 🟫',	cost: 2},
{stage: 1,	name: 'GaN Pump',	type: UpgradeType.pump,	effect: '⬜ → 🟧 🟦',	cost: 3},
{stage: 1,	name: 'ZnSe Pump',	type: UpgradeType.pump,	effect: '🟧 → ⬜ 🟦',	cost: 4},
{stage: 1,	name: 'Crystal Pump',	type: UpgradeType.pump,	effect: '🟫 → ⬜ 🟧',	cost: 3},
{stage: 1,	name: 'Prototype Pump',	type: UpgradeType.pump,	effect: '⬜ → 🟧 🟫',	cost: 2},
{stage: 1,	name: 'Bench Trap',	type: UpgradeType.trap,	effect: 'Gain ⬜',	cost: 3},
// 1	Vacuum Trap	trap	Gain 🟫	2
// 2	Bandgap Cooler	cooling	🟥 → ⬛ ⭐	1
// 2	Stabilizer Cooler	cooling	⬛ → 🟦 ⭐	1
// 2	Blue Cooler	cooling	🟦 → 🟧 ⭐	1
// 2	Ion Cooler	cooling	⬛ → 🟥 ⭐	1
// 2	Exhaust Vent	exhaust	🟦 → ⭐⭐	1
// 2	Thermal Exhaust	exhaust	⬛ → ⭐⭐⭐	1
// 2	Dopant Exhaust	exhaust	🟥 → ⭐⭐⭐	1
// 2	Vacuum Exhaust	exhaust	🟧 → ⭐⭐⭐	2
// 2	Annealing Heater	heater	🟦 ⬜ → 🟥 ✳️	3
// 2	Bandgap Heater	heater	⬛ 🟦 → 🟥 ✳️	2
// 2	Impurity Heater	heater	🟫 ⬜ → 🟦 ✳️	3
// 2	Thermal Heater	heater	🟧 🟦 → ⬛ ✳️	2
// 2	Diffusion Heater	heater	🟦 🟥 → ⬛ ✳️	1
// 2	Dopant Heater II	heater	🟥 ⬛ → 🟦 ✳️	1
// 2	Nitrogen Injection	injection	✳️ → 🟦 🟥	4
// 2	Gas Injection	injection	✳️ → ⬛ 🟥	4
// 2	Buffer Injection	injection	✳️ → ⬜ 🟦	4
// 2	Mg Nozzle	nozzle	⬛ → ⬛ ⬛	1
// 2	Red Nozzle	nozzle	🟥 → 🟥 🟥	2
// 2	GaN Nozzle II	nozzle	🟦 → 🟦 🟦	3
// 2	Purity Nozzle	nozzle	⬜ → ⬜ ⬜	3
// 2	Alloy Nozzle	nozzle	🟧 → 🟧 🟧	1
// 2	Diffusion Pump	pump	🟦 → ⬛ ⬜	2
// 2	Alloy Pump	pump	⬜ → 🟧 ⬛	1
// 2	Dopant Pump	pump	⬛ → 🟥 🟦	2
// 2	ZnSe Pump II	pump	🟧 → ⬜ 🟥	3
// 2	Red Pump	pump	🟥 → ⬛ 🟦	1
// 2	Dual Flow Pump	pump	🟦 → 🟥 ⬛	2
// 2	Recycle Pump	pump	⬛ → ⬜ 🟧	1
// 2	Ga Trap	trap	Gain 🟥	2
// 2	Thermal Trap	trap	Gain ⬛	1
// 2	Twin Chamber Trap	trap	Gain 🟦	2
// 3	Photon Cooler	cooling	🟨 → 🟥 ⭐	1
// 3	Indium Cooler	cooling	🟨 → ⬛ ⭐	1
// 3	Stabilized Cooler	cooling	🟨 → 🟦 ⭐	1
// 3	Hot Exhaust	exhaust	🟥 → ⭐⭐⭐⭐	1
// 3	Photon Exhaust II	exhaust	🟨 → ⭐⭐⭐⭐	1
// 3	Photon Vent	exhaust	⬛ → ⭐⭐⭐⭐	1
// 3	Photon Heater	heater	🟥 ⬛ → 🟨 ✳️	1
// 3	Indium Heater	heater	⬛ 🟦 → 🟨 ✳️	2
// 3	Quantum Heater	heater	🟦 ⬜ → 🟨 ✳️	3
// 3	Laser Heater	heater	🟨 🟥 → 🟨 ✳️	1
// 3	Crystal Heater	heater	🟥 🟦 → 🟨 ✳️	2
// 3	Indium Injection	injection	✳️ → 🟨 🟥	4
// 3	Indium Injection II	injection	✳️ → 🟨 🟦	4
// 3	Quantum Injection	injection	✳️ → 🟦 🟨	4
// 3	Indium Nozzle	nozzle	🟥 → 🟥 🟥	1
// 3	Quantum Nozzle	nozzle	⬜ → ⬜ ⬜	2
// 3	Final Nozzle	nozzle	🟨 → 🟨 🟨	2
// 3	Quantum Pump	pump	🟦 → 🟨 ⬛	2
// 3	Photon Pump	pump	⬜ → 🟨 🟦	3
// 3	Indium Pump	pump	🟥 → 🟨 ⬜	2
]