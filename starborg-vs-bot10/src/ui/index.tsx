import React from 'react';
import { Space, render } from '@boardzilla/core';
import { Bot10, Die, HandlerSpace, MovementSpace, PlayerSpace, Starborg, VehicleSpace, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    $.phase1.layout(Space, {rows: 4, columns: 1 });

    $.movement.layout(MovementSpace, {rows: 1, columns: 3 });
    $.vehicles.layout(VehicleSpace, {rows: 1, columns: 5 });
    $.handlers.layout(HandlerSpace, {rows: 1, columns: 5 });
    game.all(HandlerSpace).layout(Die, {offsetColumn: {x: 0, y: 0} });
    $.handlers.layout(PlayerSpace, {rows: 1 });

    game.all(Starborg).appearance({ render: x => ( 
      <div className='Starborg'>
        <div className={x.isHandler ? 'handler' : 'starborg'} />
      </div>
    ) });

    game.all(Bot10).appearance({ render: x => ( 
      <div className='Bot10'>
        <div className={x.phase1 == 'vehicle' ? 'vehicle' : 'movement'}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="12" height="10" x="25" y={game.bot10damge * 10 + 5} fill="red" stroke="black" 
            strokeWidth={x.phase1 == 'vehicle' ? '1' : '0'}
            fillOpacity={x.phase1 == 'vehicle' ? '1' : '0'} />
        </svg>
        </div>         
      </div>
    ) });

  }
});
