import { BuildCard } from './index.js'

const TopLeft: string = 'top-left'
const TopRight: string = 'top-right'
const BottomLeft: string = 'bottom-left'
const BottomRight: string = 'bottom-right'
const CenterLeft: string = 'center-left'
const CenterRight: string = 'center-right'

export const buildCards: Partial<BuildCard>[] = [
    { 
        type: 'rail', rotated: false, letter: "A", damageColumn: 1,
        routes: {TopLeft: BottomLeft, TopRight: BottomRight}, 
        flippedRoutes: {TopLeft: BottomLeft, TopRight: BottomRight} 
    },
    { 
        type: 'rail', rotated: false, letter: "A", damageColumn: 2,
        routes: {TopLeft: BottomLeft, TopRight: BottomRight}, 
        flippedRoutes: {TopLeft: BottomLeft, TopRight: BottomRight} 
    },
    { 
        type: 'rail', rotated: false, letter: "A", damageColumn: 3,
        routes: {TopLeft: BottomLeft, TopRight: BottomRight}, 
        flippedRoutes: {TopLeft: BottomLeft, TopRight: BottomRight} 
    },
    
    { 
        type: 'rail', rotated: false, letter: "B", damageColumn: 4,
        routes: {TopLeft: BottomRight, TopRight: BottomLeft},
        flippedRoutes: {TopLeft: BottomRight, TopRight: BottomLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "B", damageColumn: 5,
        routes: {TopLeft: BottomRight, TopRight: BottomLeft},
        flippedRoutes: {TopLeft: BottomRight, TopRight: BottomLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "B", damageColumn: 6,
        routes: {TopLeft: BottomRight, TopRight: BottomLeft},
        flippedRoutes: {TopLeft: BottomRight, TopRight: BottomLeft}
    },

    { 
        type: 'rail', rotated: false, letter: "C", damageColumn: 7,
        routes: {TopRight: CenterLeft, BottomLeft: CenterRight},
        flippedRoutes: {TopRight: CenterLeft, BottomLeft: CenterRight}
    },
    { 
        type: 'rail', rotated: false, letter: "C", damageColumn: 8,
        routes: {TopRight: CenterLeft, BottomLeft: CenterRight},
        flippedRoutes: {TopRight: CenterLeft, BottomLeft: CenterRight}
    },
    { 
        type: 'rail', rotated: false, letter: "C", damageColumn: 9,
        routes: {TopRight: CenterLeft, BottomLeft: CenterRight},
        flippedRoutes: {TopRight: CenterLeft, BottomLeft: CenterRight}
    },

    { 
        type: 'rail', rotated: false, letter: "D", damageColumn: 10,
        routes: {TopLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, BottomRight: CenterLeft},
    },
    { 
        type: 'rail', rotated: false, letter: "D", damageColumn: 11,
        routes: {TopLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, BottomRight: CenterLeft},
    },
    { 
        type: 'rail', rotated: false, letter: "D", damageColumn: 12,
        routes: {TopLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, BottomRight: CenterLeft},
    },

    { 
        type: 'rail', rotated: false, letter: "E", damageColumn: 1,
        routes: {TopLeft: CenterLeft, BottomRight: CenterRight},
        flippedRoutes: {TopLeft: CenterLeft, BottomRight: CenterRight},
    },
    { 
        type: 'rail', rotated: false, letter: "E", damageColumn: 2,
        routes: {TopLeft: CenterLeft, BottomRight: CenterRight},
        flippedRoutes: {TopLeft: CenterLeft, BottomRight: CenterRight},
    },
    { 
        type: 'rail', rotated: false, letter: "E", damageColumn: 3,
        routes: {TopLeft: CenterLeft, BottomRight: CenterRight},
        flippedRoutes: {TopLeft: CenterLeft, BottomRight: CenterRight},
    },

    { 
        type: 'rail', rotated: false, letter: "F", damageColumn: 4,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopRight: CenterRight, BottomLeft: CenterLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "F", damageColumn: 5,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopRight: CenterRight, BottomLeft: CenterLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "F", damageColumn: 6,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopRight: CenterRight, BottomLeft: CenterLeft}
    },

    { 
        type: 'rail', rotated: false, letter: "G", damageColumn: 7,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopLeft: CenterLeft, TopRight: CenterRight}
    },
    { 
        type: 'rail', rotated: false, letter: "G", damageColumn: 8,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopLeft: CenterLeft, TopRight: CenterRight}
    },
    { 
        type: 'rail', rotated: false, letter: "G", damageColumn: 9,
        routes: {TopRight: CenterRight, BottomLeft: CenterLeft},
        flippedRoutes: {TopLeft: CenterLeft, TopRight: CenterRight}
    },

    { 
        type: 'rail', rotated: false, letter: "H", damageColumn: 10,
        routes: {BottomLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, TopRight: CenterLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "H", damageColumn: 11,
        routes: {BottomLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, TopRight: CenterLeft}
    },
    { 
        type: 'rail', rotated: false, letter: "H", damageColumn: 12,
        routes: {BottomLeft: CenterRight, BottomRight: CenterLeft},
        flippedRoutes: {TopLeft: CenterRight, TopRight: CenterLeft}
    }

]