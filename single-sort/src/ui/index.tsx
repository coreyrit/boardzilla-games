import React from 'react';
import { render } from '@boardzilla/core';
import { default as setup } from '../game/index.js';

import './style.scss';
import { Cardboard } from '../game/component/cardboard.js';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });
    
    game.all(Cardboard).appearance({ render: x => ( 
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
          <polygon points="0,100 50,0 100,100" fill="currentColor" />
          <circle cx="50" cy="63" r="20"fill="black" opacity={x.face.clean ? 0 : 100} />
          <text x="50" y="65" text-anchor="middle" dominant-baseline="middle" fill={x.textColor} font-size="20">
            {x.face.value}
          </text>
      </svg>
    ) });

  }
});
