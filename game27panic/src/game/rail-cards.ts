import { RailCard } from './index.js'

const tl: string = 'top-left'
const tr: string = 'top-right'
const bl: string = 'bottom-left'
const br: string = 'bottom-right'
const cl: string = 'center-left'
const cr: string = 'center-right'

export const railCards: Partial<RailCard>[] = [
    {rotated: false, letter: "A", routes: {tl: bl, tr: br}, flippedRoutes: {tl: bl, tr: br}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "B", routes: {tl: br, tr: bl}, flippedRoutes: {tl: br, tr: bl}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "C", routes: {tr: cl, bl: cr}, flippedRoutes: {tr: cl, bl: cr}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "D", routes: {tl: cr, br: cl}, flippedRoutes: {tl: cr, br: cl}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "E", routes: {tl: cl, br: cr}, flippedRoutes: {tl: cl, br: cr}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "F", routes: {tr: cr, bl: cl}, flippedRoutes: {tr: cr, bl: cl}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "G", routes: {tr: cr, bl: cl}, flippedRoutes: {tl: cl, tr: cr}, unavailable: false, color: 'blue'},
    {rotated: false, letter: "H", routes: {bl: cr, br: cl}, flippedRoutes: {tl: cr, tr: cl}, unavailable: false, color: 'blue'},
]