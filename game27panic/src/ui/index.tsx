import React from 'react';
import { render, numberSetting, Space, Piece, toggleSetting, choiceSetting } from '@boardzilla/core';
import setup, { Token, YearMat, YearSpace, RailCard, Cargo, Pawn, Damage, PlayerHand, BuildCard, RailStack, BuildDeck, Obstacle, PlayerPane, Scientist, ScientistPane} from '../game/index.js';

import './style.scss';
import tracksAP from './assets/TracksA-P.svg'

//import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    // tokens: numberSetting('Number of tokens', 4, 24),
    // scientist1: choiceSetting('Player 1 scientist', {geologist: 'Geologist', astrologist: 'Astrologist', chemist: 'Chemist', phycisist: 'Physicist'}),
    // scientist2: choiceSetting('Player 2 scientist', {geologist: 'Geologist', astrologist: 'Astrologist', chemist: 'Chemist', phycisist: 'Physicist'}),
    // scientist3: choiceSetting('Player 3 scientist', {geologist: 'Geologist', astrologist: 'Astrologist', chemist: 'Chemist', phycisist: 'Physicist'}),
    // scientist4: choiceSetting('Player 4 scientist', {geologist: 'Geologist', astrologist: 'Astrologist', chemist: 'Chemist', phycisist: 'Physicist'}),
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
    },
    damaged: game => {
      return (
        <>
          <h1>
            Game Over!
          </h1>
        </>
      );
    },
    win: game => {
      return (
        <>
          <h1>
            You Win!
          </h1>
        </>
      );
    }
  },


  layout: game => {
    // game.disableDefaultAppearance();

    game.appearance({
      render: () => null
    });

    //game.disableDefaultAppearance()

    game.layout('year1930', { area: { left: 0, top: 1, width: 20, height: 50 }});
    game.layout('year1957', { area: { left: 22, top: 1, width: 20, height: 50 }});
    game.layout('year1984', { area: { left: 44, top: 1, width: 20, height: 50 }});
    game.layout('year2011', { area: { left: 66, top: 1, width: 20, height: 50 }});

    game.layout('buildCards', { area: { left: 88, top: 55, width: 30, height: 18 }});
    game.layout('availableRailCards', { area: { left: 88, top: 1, width: 30, height: 50 }});
    game.layout('unavailableRailCards', { area: { left: 88, top: 1, width: 30, height: 50 }});

    game.layout('discard', { area: { left: 88, top: 75, width: 38, height: 9 }});
    game.layout('move', { area: { left: 88, top: 84, width: 38, height: 9 }});

    game.layout('garbage', { area: { left: 0, top: 0, width: 0, height: 0 }});
    game.layout('scraps', { area: { left: -12, top: 1, width: 10, height: 50 }});

    game.all(PlayerHand).layout(BuildCard, {direction: 'ltr'});
    game.all(ScientistPane).layout(Scientist, {
      direction: 'ltr',
      gap: {x: 1, y: 0},
    });

    $.scraps.layout(Token, {
      direction: 'ttb',
      alignment: 'center',
      gap: {x: 0, y: 1},
    });


    

    game.all(Token).appearance({
      aspectRatio: 3/4,
      render: () => (
        // <div className="flipper">
        //   <div className="front"></div>
        //   <div className="back"></div>
        // </div>
        <svg width="100%" height="50%" xmlns="http://www.w3.org/2000/svg">
          <rect width="20%" height="100%" x="25%" y="0%" fill='white' />
          <rect width="20%" height="100%" x="75%" y="0%" fill='white' />

          <rect width="50%" height="10%" x="25%" y="15%" fill='white' />
          <rect width="50%" height="10%" x="25%" y="35%" fill='white' />
          <rect width="50%" height="10%" x="25%" y="55%" fill='white' />
          <rect width="50%" height="10%" x="25%" y="75%" fill='white' />
        </svg>
      )
    });

    game.all(RailCard).appearance({
      aspectRatio: 25/35,
      render: () => (
        <div>
          <div className="front"/>
          <div className="back"/>
        </div>
      ),
    });

    game.all(YearMat).appearance({
      render: () => (
        <div>
          <div className="front"/>
        </div>
      ),
    });

    game.all(PlayerHand).appearance({
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" x="0" y="0" strokeWidth="10" stroke={x.player!.color} fill={x.player!.pawn.color} fillOpacity="0.5" />
        </svg>
      )
    });

    game.all(YearSpace).appearance({
      aspectRatio: 25/35
    });

    game.all(Cargo).appearance({
      aspectRatio: 25/25,
      render: x => (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" x={x.coords.x} y={x.coords.y} fill={x.name} stroke='white' />
        </svg>
      )
    });

    game.all(Obstacle).appearance({
      render: x => (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="25,50 50,25 75,50 75,75 25,75" fill='black' stroke='white' strokeWidth='2' />
        </svg>
      )
    });

    game.all(Pawn).appearance({
      aspectRatio: 25/25,
      render: x => (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={x.x} cy="15" r="15" fill={x.color} stroke='white' strokeWidth='2' />
          <rect x={x.x-15} y="28" width="30" height="20" fill={x.color} stroke='white' strokeWidth='2' />
        </svg>
      )
    });    

    $.buildCards.appearance({ render: x => ( <svg /> ) });
    $.availableRailCards.appearance({ render: x => ( <svg /> ) });
    $.unavailableRailCards.appearance({ render: x => ( <svg /> ) });
    $.damage.appearance({ render: x => ( <svg /> ) });
    $.discard.appearance({ render: x => ( <svg /> ) });
    $.move.appearance({ render: x => ( <svg /> ) });
    $.scraps.appearance({ render: x => ( <svg /> ) });

    $.scientists.appearance({ render: x => ( <svg width="0%" /> ) });

    game.layout('scientists', { area: { left: 0, top: 25, width: 100, height: 50 }});

    game.layout('playerArea', { area: { left: -12, top: 55, width: 85, height: 40 }});
    game.all(PlayerPane).appearance({ render: x => ( <svg /> ) });
    $.playerArea.layout(PlayerHand, {
      rows: 2,
      columns: game.players.length > 2 ? 2 : 1,
      gap: 1,
    })

    game.layout('damage', { area: { left: 75, top: 55, width: 10, height: 40 }});
    $.damage.layout(Damage, {
      columns: 2,
      gap: {x: 0, y: 0},
    })
    game.all(Damage).appearance({
      aspectRatio: 1,
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="75%" r="25%" fill='red' />
        </svg>
      )
    });

    game.all(RailStack).appearance({ render: x => ( <svg /> ) });

    game.all(YearMat).layout(YearSpace, {
      rows: 7,
      columns: 3,
    })

    game.all(YearSpace).layout(Piece, {
      offsetColumn: {x: 0, y: 0},
    });

    game.all(RailStack).layout(RailCard, {
      offsetColumn: {x: 0, y: 0},
    });

    game.all(YearSpace).layout(RailCard, {
      scaling: 'fill'
    });

    game.all(PlayerHand).layout(BuildCard, {
      direction: 'ltr',
      alignment: 'left',
      gap: {x: 1, y: 0},
    });

    $.availableRailCards.layout(RailStack, {
      gap: {x: 0.25, y: 0.25},
    });
    $.unavailableRailCards.layout(RailStack, {
      gap: {x: 0.25, y: 0.25},
    });

    $.buildCards.layout(BuildCard, {
      offsetColumn: {x: 0, y: 0},
      alignment: 'left'
    });

    $.buildCards.layout(Scientist, {
      offsetColumn: {x: 0, y: 0},
      alignment: 'right'
    });

    $.discard.layout(BuildCard, {
      offsetColumn: {x: 0, y: 0},
    });

    game.all(BuildCard).appearance({
      aspectRatio: 250/350,
      render: () => (
        <div>
          <div className="front"/>
          <div className="back"/>
        </div>
      ),
    })

    game.all(Scientist).appearance({
      aspectRatio: 250/350,
      render: () => (
        <div>
          <div className="front"/>
          <div className="back"/>
        </div>
      ),
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
