import React from 'react';
import { render } from '@boardzilla/core';
import { Card, FlightCell, FlightSpace, KiteCard, LeftHandCard, TrickCard, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });
    

    // pilot
    game.layout('pilotSpace', { area: { left: 50, top: 2, width: 20, height: 28 }});
    $.pilotSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='white' />
      </svg> 
    ) });

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
    $.blueHandLeftSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='blue' />
      </svg> 
    ) });
    $.blueHandLeftSpace.layout(LeftHandCard, {
      offsetColumn: {x: 0, y: 0}
    });

    game.layout('blueHandRightSpace', { area: { left: 33, top: 80, width: 10, height: 14 }});
    $.blueHandRightSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='blue' />
      </svg> 
    ) });

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

    game.all(FlightCell).appearance({
      render: () => (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" x="0" y="0" fillOpacity="0" stroke='black' />
        </svg> 
      ),
    })

    game.layout('redHandLeftSpace', { area: { left: 55, top: 80, width: 10, height: 14 }});
    $.redHandLeftSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='red' />
      </svg> 
    ) });
    game.layout('redHandRightSpace', { area: { left: 103, top: 80, width: 10, height: 14 }});
    $.redHandRightSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='red' />
      </svg> 
    ) });

    game.layout('redTricksSpace', { area: { left: 92, top: 2, width: 28, height: 30 }});
    $.redTricksSpace.appearance({ render: x => ( 
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" x="0" y="0" fill='red' />
      </svg> 
    ) });

    // draw kites
    game.all(KiteCard).appearance({ render: x => ( 
      <div className='KiteCard'>
        <div className={x.flight} />
      </div>
    ) });

    // stack tricks
    $.timerSpace.layout(Card, {
      //offsetColumn: {x: 0, y: 0},
    })
  }
});
