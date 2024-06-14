import { TrickCard } from './index.js'

export const tricks: Partial<TrickCard>[] = [
    {nm: 'Flapjack', vp: 2, wind: 3, xwind: 1, reqFill: true, reqRows: ["A"], ltReqDeg: 0, rtReqDeg: 0, flip: true, hor: 4, ver: 0, spin: 0},
    {nm: 'Combo', vp: 2, wind: 2, xwind: 3, reqFill: false, reqRows: ["C"], ltReqDeg: 135, rtReqDeg: 225, flip: true, hor: 3, ver: -2, spin: 225},

    {nm: 'Stall'},
    {nm: 'Comet'},

    {nm: 'Cascade'},
    {nm: 'Side Slide'},

    {nm: 'Half Axel'},
    {nm: 'Axel'},

    {nm: 'Slot Machine'},
    {nm: 'Taz Machine'},

    {nm: 'Yo-Fade'},
    {nm: 'Fade'},

    {nm: 'Lazy Susan'},
    {nm: 'Rolling Susan'},

    {nm: 'Backflip'},
    {nm: "Jacob's Ladder"},
];