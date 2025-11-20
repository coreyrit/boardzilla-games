import React from 'react';
import { render } from '@boardzilla/core';
import { default as setup } from '../game/index.js';

import './style.scss';
import { Cardboard } from '../game/component/cardboard.js';
import { Plastic } from '../game/component/plastic.js';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });
    
    game.all(Cardboard).appearance({ render: x => ( 
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <polygon points="10,90 50,15 90,90" fill="currentColor" />
          <circle cx="50" cy="63" r="20"fill="black" opacity={x.clean ? 0 : 100} />
          <text x="50" y="65" text-anchor="middle" dominant-baseline="middle" fill={x.textColor} font-size="20">
            {x.face}
          </text>
      </svg>
    ) });

    game.all(Plastic).appearance({ render: x => ( 
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <rect x="10" y="10" width="80" height="80" fill='currentColor'/>
          <text x="50" y="55" text-anchor="middle" dominant-baseline="middle" fill={x.textColor} font-size="20">
            {x.face}
          </text>
      </svg>
    ) });

  }
});
