import { FundingCard, FundingType } from "./components.js";

export const fundingCards: Partial<FundingCard>[] = [
    {name: 'Extra Trap Slot',	type: FundingType.Permanent,	effect: 'Gain +1 storage slot (store 1 additional cube between rounds).'},
    {name: 'Emergency Reset',	type: FundingType.Instant,	effect: 'Immediately recover one token from your cooldown pool.'},
    {name: 'Investor Favor',	type: FundingType.Permanent,	effect: 'Gain +3 ⭐ whenever you buy an upgrade that costs 3 or more.'},
    {name: 'Cube Draw',	type: FundingType.Permanent,	effect: 'When gaining cubes you may take them from 2 piles.  Combine those piles for other players after completion.'},
    {name: 'Selective Draw', type: FundingType.Permanent,	effect: 'Instant	Place 1 blue cube and 1 white cube in the bag and mix.  Next, draw 4 cubes from the bag and keep up to 2.  Place the rest back into the bag.'},
    {name: 'Power Refund',	type: FundingType.Permanent,	effect: 'After testing, keep one cube used for scoring.  You must have room for it in storage.'},
    {name: 'Mini-Storage',	type: FundingType.Permanent,	effect: 'You may store up to 2 blue cubes here between rounds.'},
    {name: 'Priority Window',	type: FundingType.Instant,	effect: 'Add +2 to your power when resolving Funding.'},
    {name: 'Loaned Technician',	type: FundingType.Ongoing,	effect: 'Use one upgrade on your board twice during the testing phase.'},
    {name: 'Shared Upgrade',	type: FundingType.Permanent,	effect: 'Upgrades cost 1 less.'},
    {name: 'Converter Voucher',	type: FundingType.Ongoing,	effect: 'During testing, activate one upgrade without paying its requirement.'},
    {name: 'Market Peek',	type: FundingType.Permanent,	effect: 'Instead of drawing random cards when you can\'t afford an upgrade, draw 2 upgrades , keep 1, and place the other on the bottom of the deck.'},
//     Power Swap	Instant	Swap all tokens in your cooldown pool with all of the tokens in your available pool.
//     Storage Insurance	Permanent	Gain 2 ⭐ for each leftover cube you don't store after testing.
//     R&D Grant	Instant	Draw 2 funding cards, keep 1, and discard the other.
//     Late-Stage Funding	Instant	In phase III, draw 2 funding cards.
//     Reagent Voucher	Ongoing	Take either 1 white or 1 blue cube from the pool each round.
//     Temporary Slot	Permanent	You may place an upgrade of any type here.
//     Market Surge	Permanent	When gaining cubes, take +1 (max 4) above the power assigned.
//     Victory Research	Instant	Score 5 ⭐ immediately.
//     Investor Trust	Permanent	Discarding funding cards gives you any 2 cubes instead of 1.
//     Experimental Catalyst	Ongoing	Convert one cube of your choice into any color once per round.
//     Patent License	Permanent	When another player buys an upgrade of a type you own gain +1 ⭐.
//     Efficiency Audit	Permanent	Your upgrades that require 2 cubes now only require 1 cube (your choice).
//     Investor Bonus	Instant	Gain +4 ⭐ for each upgrade you purchased this phase.
//     Backup Generator	Permanent	Your exhaust upgrade can be used an unlimited number of times during Testing.
//     Precision Tools	Ongoing	When converting cubes with an upgrade you may change one cube in the result to any color.
//     Reactor Grant	Permanent	When using a Heater upgrade also gain +1 ⭐
//     Maintenance Delay	Instant	Ignore an Employer Letter’s negative effect.
//     Research Collaboration	Ongoing	During the Test phase copy the effect of one other player’s Trap upgrade.
//     Overclocked Reactor	Ongoing	Use one of the upgrades remaining in the market during testing.
//     Public Demonstration	Ongoing	Chose an upgrade to turn without using it and gain ⭐ equal to its cost.
]