import { TrickCard } from './index.js'

export const tricks: Partial<TrickCard>[] = [
    {nm: 'Flapjack', vp: 2, wind: 3, xwind: 1, reqFill: true, reqRows: ["A"], ltReqDeg: 0, rtReqDeg: 0, flip: true, hor: 4, ver: 0, spin: 0},
    {nm: 'Combo', vp: 2, wind: 2, xwind: 3, reqFill: false, reqRows: ["C"], ltReqDeg: 135, rtReqDeg: 225, flip: true, hor: 3, ver: -2, spin: 225},

    {nm: 'Stall', vp: 2, wind: 1, xwind: 2, reqFill: true, reqRows: ["B"], ltReqDeg: 90, rtReqDeg: 270, flip: false, hor: 3, ver: 1, spin: 270},
    {nm: 'Comet', vp: 3, wind: 3, xwind: 1, reqFill: false, reqRows: ["D"], ltReqDeg: 90, rtReqDeg: 270, flip: true, hor: 2, ver: -1, spin: 0},

    {nm: 'Cascade', vp: 2, wind: 1, xwind: 2, reqFill: false, reqRows: ["C", "D"], ltReqDeg: 90, rtReqDeg: 270, flip: false, hor: 2, ver: -1, spin: 315},
    {nm: 'Side Slide', vp: 3, wind: 2, xwind: 3, reqFill: true, reqRows: ["E"], ltReqDeg: 0, rtReqDeg: 0, flip: false, hor: 5, ver: 0, spin: 0},

    {nm: 'Half Axel', vp: 1, wind: 1, xwind: 2, reqFill: false, reqRows: ["A", "B"], ltReqDeg: 45, rtReqDeg: 315, flip: false, hor: 4, ver: 2, spin: 270},
    {nm: 'Axel', vp: 2, wind: 3, xwind: 1, reqFill: false, reqRows: ["B"], ltReqDeg: 90, rtReqDeg: 270, flip: true, hor: 2, ver: 0, spin: 0},

    {nm: 'Slot Machine', vp: 2, wind: 2, xwind: 3, reqFill: true, reqRows: ["C", "D"], ltReqDeg: 135, rtReqDeg: 225, flip: true, hor: 3, ver: 1, spin: 315},
    {nm: 'Taz Machine', vp: 3, wind: 3, xwind: 1, reqFill: false, reqRows: ["D", "E"], ltReqDeg: 90, rtReqDeg: 270, flip: true, hor: 4, ver: -1, spin: 180},

    {nm: 'Yo-Fade', vp: 4, wind: 0, xwind: 0, reqFill: true, reqRows: ["D"], ltReqDeg: 180, rtReqDeg: 180, flip: true, hor: 3, ver: -3, spin: 135},
    {nm: 'Fade', vp: 1, wind: 3, xwind: 1, reqFill: false, reqRows: ["B", "C"], ltReqDeg: 45, rtReqDeg: 315, flip: false, hor: 2, ver: 2, spin: 0},

    {nm: 'Lazy Susan', vp: 1, wind: 1, xwind: 2, reqFill: true, reqRows: ["A", "B"], ltReqDeg: 0, rtReqDeg: 0, flip: true, hor: 1, ver: 3, spin: 45},
    {nm: 'Rolling Susan', vp: 2, wind: 2, xwind: 3, reqFill: false, reqRows: ["C"], ltReqDeg: 45, rtReqDeg: 315, flip: true, hor: 3, ver: -1, spin: 90},

    {nm: 'Backflip', vp: 1, wind: 1, xwind: 2, reqFill: true, reqRows: ["B", "C"], ltReqDeg: 0, rtReqDeg: 0, flip: true, hor: 1, ver: 1, spin: 135},
    {nm: "Jacob's Ladder", vp: 3, wind: 2, xwind: 3, reqFill: false, reqRows: ["D", "E"], ltReqDeg: 180, rtReqDeg: 180, flip: true, hor: 2, ver: -2, spin: 225},
];