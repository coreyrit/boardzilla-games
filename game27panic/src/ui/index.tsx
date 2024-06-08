import React from 'react';
import { render, numberSetting, Space } from '@boardzilla/core';
import setup, { Token, YearMat, YearSpace, RailCard, Cargo} from '../game/index.js';

import './style.scss';
//import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    tokens: numberSetting('Number of tokens', 4, 24),
  },

  announcements: {
    crashed: game => {
      return (
        <>
          <h1>
            Game Over!
          </h1>
        </>
      );
    }
  },

  layout: game => {
    game.appearance({
      render: () => null
    });

    game.all(Token).appearance({
      aspectRatio: 1,
      render: () => (
        <div className="flipper">
          <div className="front"></div>
          <div className="back"></div>
        </div>
      )
    });

    game.all(RailCard).appearance({
      render: x => <div className={'railCard' + (x.unavailable ? 'Unavailable' : 'Available')}>{x.name}</div>
    });

    game.all(Cargo).appearance({
      render: x => <div className={x.name + 'Cargo'} />
    });

    game.all(YearMat).layout(YearSpace, {
      rows: {min: 7},
      columns: {min: 3},
    })

    game.layout(Space, {
      gap: 1,
      margin: 1
    });

    game.all('pool').layout(Token, {
      gap: 1,
      margin: 1
    });
  }
});
