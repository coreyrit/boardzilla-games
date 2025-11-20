import React from 'react';
import { render, Space } from '@boardzilla/core';
import { default as setup, MyGame } from '../game/index.js';

import './style.scss';
import { Component } from '../game/component/component.js';
import { Cardboard } from '../game/component/cardboard.js';
import { Plastic } from '../game/component/plastic.js';
import { Glass } from '../game/component/glass.js';
import { Metal } from '../game/component/metal.js';

render(setup, {
  settings: {
  },
  layout: game => {
    const LEFT_POSITION_OFFSET = 25; // formerly -25

    game.appearance({
      render: () => null
    });

    game.layout('table', { area: { left: 15, top: 22, width: 85, height: 78 }});
    game.layout('box', { area: { left: 0, top: 0, width: 0, height: 0 }});
    game.layout('playersSpace', { area: { left: 15, top: 0, width: 85, height: 22 }});

    //  game.layoutAsDrawer($.playersSpace as Space<MyGame>, 
    //   { area: { left: 0, top: 90, width: 100, height: 10 }, openDirection: 'up', tab: 'Players',
    //   openIf: actions => actions.some(a => 
    //     [
    //       'recycleChoice'
    //     ]
    //     .includes(a.name)),
    //   closeIf: actions => actions.some(a => 
    //       [
    //         'recycleWhat'
    //       ]
    //       .includes(a.name)),
    //   });

      var index = 0;
      let tabSpaces: Record<string, Space<MyGame> | string> = {};
      let tabDefs: Record<string, React.ReactNode> = {};
      game.players.forEach(x => {
        tabSpaces['player' + index] = x.hand;
        const tab = (
          <div>          
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>            
              <rect x="0" y="0" width="100" height="100" fill='currentColor'/>
            </svg>
            <div className='playerTab'>
              {x.name}
            </div>
          </div>
        );
        tabDefs['player' + index]  = tab;

        game.players[index].hand.layout(Component, {columns: 10, rows: 2, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
        index++;        
      });

      $.playersSpace.layoutAsTabs(tabSpaces,
      { area: { left: 0, top: 10 , width: 100, height: 80 }, tabDirection: 'up', tabs: tabDefs,
      setTabTo: actions => {
        if(game.players.allCurrent().length > 0) {
          return 'player' + game.players.indexOf(game.players.allCurrent()[0]);
        } else {
          return '';
        }
      }
    }
    );

    
    game.all(Cardboard).appearance({ render: x => ( 
      <div className="Cardboard">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <polygon points="10,90 50,15 90,90" fill={x.faceUp ? "currentColor" : "#964b00"} />
          <circle cx="50" cy="63" r="20"fill="black" opacity={x.clean || !x.faceUp ? 0 : 100} />
          <text x="50" y="65" text-anchor="middle" dominant-baseline="middle" fill={x.textColor} opacity={x.faceUp ? 100 : 0} font-size="20">
            {x.face}
          </text>
      </svg>
      </div>
    ) });

    game.all(Plastic).appearance({ render: x => ( 
      <div className="Plastic">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <rect x="10" y="10" width="80" height="80" fill='currentColor'/>
          <text x="50" y="55" text-anchor="middle" dominant-baseline="middle" fill={x.textColor} font-size="20">
            {x.face}
          </text>
      </svg>
      </div>
    ) });

    game.all(Glass).appearance({ render: x => ( 
      <div className="Glass">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <circle cx="50" cy="50" r="40" fill="currentColor" />
      </svg>
      </div>
    ) });

    game.all(Metal).appearance({ render: x => ( 
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
        <rect x="30" y="30" width="40" height="40" fill='currentColor'/>
      </svg>
    ) });

    // $.box.appearance({render: x=> ( <div /> )})

  }
});
