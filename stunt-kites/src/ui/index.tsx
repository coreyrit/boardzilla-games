import React from 'react';
import { render } from '@boardzilla/core';
import { Card, FlightCard, FlightCell, FlightSpace, HandCard, HandSpace, KiteCard, PilotCard, PilotSpace, TrickCard, TrickChoiceSpace, WorkerSpace, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });
    
    game.layout('garbage', { area: { left: 60, top: 10, width: 1, height: 1 }});
    $.garbage.appearance({ render: x => ( <svg /> ) })

    // pilot
    game.layout('pilotSpace', { area: { left: 50, top: 2, width: 20, height: 33.5 }});

    // choices
    game.layout('trickFrontSpace', { area: { left: 20, top: 35, width: 28, height: 20 }});
    game.layout('trickBackSpace', { area: { left: 50, top: 35, width: 28, height: 20 }});
    
    game.layout('nw1', { area: { left: 50, top: 7.5, width: 4, height: 7 }});
    game.layout('nw2', { area: { left: 53, top: 7.5, width: 4, height: 7 }});
    game.layout('w1', { area: { left: 50, top: 15.5, width: 4, height: 7 }});
    game.layout('w2', { area: { left: 53, top: 15.5, width: 4, height: 7 }});
    game.layout('sw1', { area: { left: 50, top: 23, width: 4, height: 7 }});
    game.layout('sw2', { area: { left: 53, top: 23, width: 4, height: 7 }});

    game.layout('ne1', { area: { left: 66, top: 7.5, width: 4, height: 7 }});
    game.layout('ne2', { area: { left: 63, top: 7.5, width: 4, height: 7 }});
    game.layout('e1', { area: { left: 66, top: 15.5, width: 4, height: 7 }});
    game.layout('e2', { area: { left: 63, top: 15.5, width: 4, height: 7 }});
    game.layout('se1', { area: { left: 66, top: 23, width: 4, height: 7 }});
    game.layout('se2', { area: { left: 63, top: 23, width: 4, height: 7 }});
    

    game.all(PilotSpace).layout(WorkerSpace, {
      offsetColumn: {x: 0, y: 0},
    })

    $.pilotSpace.appearance({ render: x => ( <svg /> ) })

    game.all(PilotSpace).appearance({ render: x => ( <svg /> ) })
    game.all(WorkerSpace).appearance({ render: x => ( <svg /> ) })
    game.all(TrickChoiceSpace).appearance({ render: x => ( <svg /> ) })
    game.all(HandSpace).appearance({ render: x => ( <svg /> ) })
    
    game.all(WorkerSpace, {side: 'left'}).appearance({ 
      render: x => ( 
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 100,50 0,100" fill={x.occupiedColor} stroke='black' strokeWidth='0' fillOpacity={x.occupiedColor.startsWith('none') ? 0 : 1}          />  
          <polygon points="0,0 100,50 0,100" stroke='black' strokeWidth='5' opacity={x.highlight ? 1 : 0} fillOpacity='0' />  
        </svg> 
      ) 
    });
    game.all(WorkerSpace, {side: 'right'}).appearance({ 
      render: x => ( 
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="100,0 0,50 100,100" fill={x.occupiedColor} stroke='black' strokeWidth='0' fillOpacity={x.occupiedColor.startsWith('none') ? 0 : 1}          />  
          <polygon points="100,0 0,50 100,100" stroke='black' strokeWidth='5' opacity={x.highlight ? 1 : 0} fillOpacity='0' />  
        </svg> 
      ) 
    });

    $.pilotSpace.layout(Card, {
      offsetColumn: {x: 0, y: 0},
    })


    // timer
    game.layout('timerSpace', { area: { left: 25, top: 2, width: 20, height: 28 }});
    $.timerSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='white' />
      </svg> 
    ) });

    // blue player
    game.layout('blueFlightSpace', { area: { left: 0, top: 60, width: 28, height: 20 }});
    $.blueFlightSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='blue' />
      </svg> 
    ) });
    $.blueFlightSpace.layout(FlightCell, {
      columns: 7,
      rows: 5
    })

    game.layout('blueHandLeftSpace', { area: { left: -15, top: 80, width: 10, height: 14 }});
    game.layout('blueHandRightSpace', { area: { left: 33, top: 80, width: 10, height: 14 }});

    game.layout('blueTricksSpace', { area: { left: -15, top: 2, width: 28, height: 30 }});
    $.blueTricksSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='blue' />
      </svg> 
    ) });

    // red player
    game.layout('redFlightSpace', { area: { left: 70, top: 60, width: 28, height: 20 }});
    $.redFlightSpace.layout(FlightCell, {
      columns: 7,
      rows: 5
    })
    $.redFlightSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='red' />
      </svg> 
    )});

    game.layout('redHandLeftSpace', { area: { left: 55, top: 80, width: 10, height: 14 }});
    game.layout('redHandRightSpace', { area: { left: 103, top: 80, width: 10, height: 14 }});

    game.layout('redTricksSpace', { area: { left: 92, top: 2, width: 28, height: 30 }});
    $.redTricksSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='red' />
      </svg> 
    ) });

    // pilot card
    game.all(PilotCard).appearance({
      render: x => (
        <div className='PilotSpace'>
          <div className={x.color} />
        </div>
      ),
    })

    // draw kites
    game.all(KiteCard).appearance({ render: x => ( 
      <div className='KiteCard'>
        <div className={'kite' + x.rotation + (x.flipped ? 'back' : 'front')} />
      </div>
    ) });

    // draw tricks
    game.all(TrickCard).appearance({ render: x => ( 
      <div className='TrickCard'>
        <div className='front' />
      </div>
    ) });

    
    $.pilotSpace.layout(Card, {
      offsetColumn: {x: 0, y: 0},
    })

    // stack tricks
    $.timerSpace.layout(Card, {
      //offsetColumn: {x: 0, y: 0},
    })

    // flight cards
    game.all(FlightCard).appearance({
      render: x => (
        <div className='FlightCard'>
          <div className={x.flipped ? 'back' : 'front'} />
        </div>
      ),
    })

    // hand cards
    game.all(HandCard).appearance({
      render: x => (
        <div className='HandCard'>
          <div className={x.charged ? 'front' : 'back'} />
        </div>
      ),
    })

    $.blueFlightSpace.appearance({ render: x => ( <svg /> ) });
    game.all(FlightCell).appearance({ render: x => ( <svg /> ) });
  }
});
