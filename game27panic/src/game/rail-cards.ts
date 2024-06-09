import { RailCard } from './index.js'

// const tl: string = 'top-left'
// const tr: string = 'top-right'
// const bl: string = 'bottom-left'
// const br: string = 'bottom-right'
// const cl: string = 'center-left'
// const cr: string = 'center-right'

export const railCards: Partial<RailCard>[] = [
    {rotated: false, letter: "A", routes: {'tl': 'bl', 'tr': 'br'}, unavailable: false},
    {rotated: false, letter: "B", routes: {'tl': 'br', 'tr': 'bl'}, unavailable: false},
    {rotated: false, letter: "C", routes: {'tr': 'cl', 'bl': 'cr'}, unavailable: false},
    {rotated: false, letter: "D", routes: {'tl': 'cr', 'br': 'cl'}, unavailable: false},
    {rotated: false, letter: "E", routes: {'tl': 'cl', 'br': 'cr'}, unavailable: false},
    {rotated: false, letter: "F", routes: {'tr': 'cr', 'bl': 'cl'}, unavailable: false},
    {rotated: false, letter: "G", routes: {'br': 'cr', 'bl': 'cl'}, unavailable: false},
    {rotated: false, letter: "H", routes: {'bl': 'cr', 'br': 'cl'}, unavailable: false},

    {rotated: false, letter: "I", routes: {'tl': 'bl', 'br': 'cr'}, unavailable: false},
    {rotated: false, letter: "J", routes: {'bl': 'cl', 'br': 'tr'}, unavailable: false},
    {rotated: false, letter: "K", routes: {'bl': 'tr', 'br': 'cl'}, unavailable: false},
    {rotated: false, letter: "L", routes: {'bl': 'cr', 'br': 'tl'}, unavailable: false},
    {rotated: false, letter: "M", routes: {'bl': 'cl', 'br': 'tl'}, unavailable: false},
    {rotated: false, letter: "N", routes: {'bl': 'tr', 'br': 'cr'}, unavailable: false},
    {rotated: false, letter: "O", routes: {'bl': 'tl', 'br': 'cl'}, unavailable: false},
    {rotated: false, letter: "P", routes: {'bl': 'cr', 'br': 'tr'}, unavailable: false},
]
