import React from 'react';
import { render, Space } from '@boardzilla/core';
import { Level2Region, Level1Region, Level0Region, PlayRegion, RoundSpace, RoundsRegion, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.showLayoutBoundingBoxes()

    $.board.layout(Space, {
      columns: 1,
    })

    $.board.layout(RoundsRegion, {
      area: { left: 0, top: 0, width: 100, height: 20 },
    })
    $.board.layout(PlayRegion, {
      area: { left: 0, top: 20, width: 100, height: 80 },
    })

    $.rounds.layout(Space, {
      rows: 1,
    })

    $.sites.layout(Space, {
      columns: 1,
    })

    $.sites.layout(Level2Region, {
      area: { left: 0, top: 0, width: 100, height: 25 },
    })
    $.sites.layout(Level1Region, {
      area: { left: 0, top: 25, width: 100, height: 50 },
    })
    $.sites.layout(Level0Region, {
      area: { left: 0, top: 75, width: 100, height: 25 },
    })

    $.level2.layout(Space, {
      rows: 1,
    })
    $.level1.layout(Space, {
      rows: 2,
      columns: 4,
    })
    $.level0.layout(Space, {
      rows: 1,
    })

  }
});
