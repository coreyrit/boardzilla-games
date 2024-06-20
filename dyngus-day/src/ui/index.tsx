import React from 'react';
import { Piece, render } from '@boardzilla/core';
import { Card, Collection, FirstPlayerCard, PlayerSpace, PolkaCard, PussyWillowCard, Score, SplashCard, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });

    game.all(Collection).appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" stroke="black" strokeWidth="2" fillOpacity="0" />
      </svg> 
    ) });

    $.deck.appearance({
      render: () => null
    });

    game.all(SplashCard).appearance({ render: x => ( 
      <div className='SplashCard'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(PussyWillowCard).appearance({ render: x => ( 
      <div className='PussyWillowCard'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(PolkaCard).appearance({ render: x => ( 
      <div className='PolkaCard'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(FirstPlayerCard).appearance({ render: x => ( 
      <div className='FirstPlayerCard'>
        <div className='front' />
      </div>
    ) });

    game.all(Collection).layout(Card, {
      rows: 1,
      margin: 2,    
    });

    game.all(PlayerSpace).layout(Card, {
      offsetColumn: 0,
      offsetRow: 0,
    });

    $.deck.layout(Card, {
      offsetColumn: {x: 0, y: 0},
    })

    game.all(PlayerSpace).appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill={x.player.color} />
      </svg> 
    ) });

    game.all(Score).appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <text x="50" y="98" fontSize="12" fill="black">{x.toString()}</text>
      </svg> 
    ) });

    switch(game.players.length) {
      case 1: {
        game.layout('collection-1', { area: { left: 8, top: 5, width: 40, height: 18 }});
        game.layout('collection-2', { area: { left: 52, top: 5, width: 40, height: 18 }});
        game.layout('collection-3', { area: { left: 8, top: 25, width: 40, height: 18 }});
        game.layout('collection-4', { area: { left: 52, top: 25, width: 40, height: 18 }});

        game.layout('player-1', { area: { left: 44, top: 70, width: 12, height: 18 }});

        game.layout('deck', { area: { left: 40, top: 45, width: 20, height: 20 }});
        break;
      }
      case 2: {
        game.layout('collection-1', { area: { left: 5, top: 21, width: 40, height: 18 }});
        game.layout('collection-2', { area: { left: 55, top: 21, width: 40, height: 18 }});
        game.layout('collection-3', { area: { left: 5, top: 61, width: 40, height: 18 }});
        game.layout('collection-4', { area: { left: 55, top: 61, width: 40, height: 18 }});

        game.layout('player-1', { area: { left: 44, top: 2, width: 12, height: 18 }});
        game.layout('player-2', { area: { left: 44, top: 80, width: 12, height: 18 }});

        game.layout('deck', { area: { left: 40, top: 40, width: 20, height: 20 }});
        break;
      }
      case 3: {
        game.layout('collection-1', { area: { left: 0, top: 35, width: 40, height: 18 }});
        game.layout('collection-2', { area: { left: 60, top: 35, width: 40, height: 18 }});
        game.layout('collection-3', { area: { left: 30, top: 82, width: 40, height: 18 }});
        game.layout('collection-4', { area: { left: 30, top: 0, width: 40, height: 18 }});

        game.layout('player-1', { area: { left: 44, top: 20, width: 12, height: 18 }});        
        game.layout('player-2', { area: { left: 80, top: 65, width: 12, height: 18 }});
        game.layout('player-3', { area: { left: 8, top: 65, width: 12, height: 18 }});

        game.layout('deck', { area: { left: 40, top: 58, width: 20, height: 20 }});
        break;
      }
      case 4: {
        game.layout('collection-1', { area: { left: 0, top: 21, width: 40, height: 18 }});
        game.layout('collection-2', { area: { left: 60, top: 21, width: 40, height: 18 }});
        game.layout('collection-3', { area: { left: 60, top: 61, width: 40, height: 18 }});
        game.layout('collection-4', { area: { left: 0, top: 61, width: 40, height: 18 }});

        game.layout('player-1', { area: { left: 44, top: 10, width: 12, height: 18 }});
        game.layout('player-2', { area: { left: 80, top: 41, width: 12, height: 18 }});
        game.layout('player-3', { area: { left: 44, top: 70, width: 12, height: 18 }});
        game.layout('player-4', { area: { left: 8, top: 41, width: 12, height: 18 }});

        game.layout('deck', { area: { left: 40, top: 40, width: 20, height: 20 }});
        break;
      }
    }

  }
});
