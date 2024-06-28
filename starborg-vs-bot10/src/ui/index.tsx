import React from 'react';
import { Space, render } from '@boardzilla/core';
import { D6, useD6 } from '@boardzilla/core/components';

import { Bot10, RefSpace, Starborg, default as setup } from '../game/index.js';
import { HandlerSpace, MovementSpace, PlayerSpace, VehicleSpace} from '../game/phase1.js';

import './style.scss';
import { BotSpace, StarborgSpace } from '../game/phase2.js';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({render: () => null});


    game.layout('ref', { area: { left: 50, top: 80, width: 50, height: 10 }});
    game.all(RefSpace).appearance({ render: x => ( 
      <div className='RefSpace'>
       <b>{game.infoHeader}</b><br />
       {game.info}
      </div>
    ) });

    game.layout('phase1', { area: { left: 0, top: 0, width: 100, height: 100 }});
    $.phase1.appearance({ render: x=> null})
    $.movement.appearance({ render: () => null})
    game.all(MovementSpace).appearance({ render: () => null})
    $.vehicles.appearance({ render: () => null})
    game.all(VehicleSpace).appearance({ render: () => null})
    $.handlers.appearance({ render: () => null})
    game.all(HandlerSpace).appearance({ render: x => ( 
      <div className='HandlerSpace' />
    ) });
    game.all(StarborgSpace).appearance({ render: x => ( 
      <div className='StarborgSpace' />
    ) });
    game.all(BotSpace).appearance({ render: x => ( 
      <div className='BotSpace' />
    ) });

    game.layout('player', { area: { left: 50, top: 80, width: 50, height: 25 }});
  
    game.layout('head', { area: { left: 66, top: 5, width: 34, height: 25 }});
    game.layout('rightArm', { area: { left: 50, top: 30, width: 34, height: 25 }});
    game.layout('leftArm', { area: { left: 84, top: 30, width: 34, height: 25 }});
    game.layout('rightLeg', { area: { left: 50, top: 55, width: 34, height: 25 }});
    game.layout('leftLeg', { area: { left: 84, top: 55, width: 34, height: 25 }});

    game.all(StarborgSpace).layout(D6, {offsetColumn: {x: 0, y: 0} });
    game.all(BotSpace).layout(D6, {offsetColumn: {x: 0, y: 0} });

    game.layout('nw', { area: { left: 0, top: 11, width: 25, height: 34 }});
    game.layout('ne', { area: { left: 25, top: 11, width: 25, height: 34 }});
    game.layout('sw', { area: { left: 0, top: 45, width: 25, height: 34 }});
    game.layout('se', { area: { left: 25, top: 45, width: 25, height: 34 }});


    $.phase1.layout(Space, {rows: 4, columns: 1 });

    $.movement.layout(MovementSpace, {rows: 1, columns: 3 });
    $.vehicles.layout(VehicleSpace, {rows: 1, columns: 5 });
    $.handlers.layout(HandlerSpace, {rows: 1, columns: 5 });
    game.all(HandlerSpace).layout(D6, {offsetColumn: {x: 0, y: 0} });
    $.handlers.layout(PlayerSpace, {rows: 1 });

    game.all(Starborg).appearance({ render: x => ( 
      <div className='Starborg'>
        <div className={x.isHandler ? 'handler' : 'starborg'}>

        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="12" height="10" x={x.getX()} y={x.getY()} fill="red" stroke="black"
            strokeWidth={x.showCube() ? '1' : '0'}
            fillOpacity={x.showCube() ? '1' : '0'} />
        </svg>
        </div>

      </div>
    ) });

    game.all(Bot10).appearance({ render: x => ( 
      <div className='Bot10'>
        <div className={game.phase == 1 ? (x.phase1 == 'vehicle' ? 'vehicle' : 'movement') : 'bot10'}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="12" height="10" x="25" y={game.bot10damage * 10 + 5} fill="red" stroke="black" 
            strokeWidth={game.phase == 1 && x.phase1 == 'vehicle' ? '1' : '0'}
            fillOpacity={game.phase == 1 && x.phase1 == 'vehicle' ? '1' : '0'} />

          <rect width="100" height="100" x="0" y="0" fill="black" fillOpacity={x.damaged ? 0.5 : 0} />
        </svg>
        </div>         
      </div>
    ) });


    useD6(game);
  }
});
