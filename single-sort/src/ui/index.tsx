import React from 'react';
import { render, Space } from '@boardzilla/core';
import { default as setup, MyGame, Score, Table, Trash, PlayersSpace, Reference, TheVoid, ScoreReference, TurnReference } from '../game/index.js';

import './style.scss';
import { Component } from '../game/component/component.js';
import { Cardboard } from '../game/component/cardboard.js';
import { Plastic } from '../game/component/plastic.js';
import { Glass } from '../game/component/glass.js';
import { Metal } from '../game/component/metal.js';
import { Goal } from '../game/component/goal.js';
import { Hand } from '../game/hand.js';

render(setup, {
  settings: {
  },
  layout: game => {
    const LEFT_POSITION_OFFSET = 25; // formerly -25

    game.appearance({
      render: () => null
    });

    game.layout('table', { area: { left: 15, top: 22, width: 80, height: 78 }});
    game.layout('box', { area: { left: 0, top: 0, width: 0, height: 0 }});
    game.layout('playersSpace', { area: { left: 15, top: 0, width: 80, height: 22 }});
    game.layout('theVoid', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.layout('reference', { area: { left: 20, top: 0, width: 80, height: 100 }});

    game.layout('trash', { area: { left: 0, top: 0, width: 15, height: 75 }});
    $.trash.layout(Component, {area: { left: 0, top: 0, width: 100, height: 100 },
      columns: 2, rows: 15, gap: {x: 0, y: 15}, scaling: 'fill'
    })

     game.layoutAsDrawer($.trash as Space<MyGame>, 
      { area: { left: 0, top: 0, width: 15, height: 90 }, openDirection: 'right', tab: 'Trash' }
     );

      var index = 0;
      let tabSpaces: Record<string, Space<MyGame> | string> = {};
      let tabDefs: Record<string, React.ReactNode> = {};
      game.players.forEach(x => {

        x.hand.layout(Score, {area: { left: 85, top: 0, width: 15, height: 10 }});

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

        game.players[index].hand.layout(Goal, {area: {left: 70, top: 0, width: 20, height: 10}});
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

    game.all(Score).appearance({ render: x => ( 
      <div className="Score">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">      
          <text x="60" y="45" text-anchor="middle" dominant-baseline="middle" font-size="30" fill="red" >
            {x.calculateScore()}
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
      <div className="Metal">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>      
        <rect x="30" y="30" width="40" height="40" fill='currentColor'/>
      </svg>
      </div>
    ) });

    game.all(Goal).appearance({ render: x => ( 
      <div className="Goal">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.targetColor}>      
        <text x="0  " y="32" text-anchor="left" dominant-baseline="middle" fill="black" font-size="20">
            {x.targetNumbers != undefined ? x.targetNumbers[0].toString() + "/": ""}
        </text>
        <text x="55" y="32" text-anchor="left" dominant-baseline="middle" fill="black" font-size="20">
            {x.targetNumbers != undefined ? x.targetNumbers[1].toString() + "/": ""}
        </text>
        <circle cx="30" cy="30" r="10" fill="black" stroke={x.targetColor} strokeWidth="5" opacity={x.targetNumbers == undefined ? "0" : "100"}/>
        <circle cx="87" cy="30" r="10" fill="black" stroke={x.targetColor} strokeWidth="5" opacity={x.targetNumbers == undefined ? "0" : "100"}/>
        <text x="30" y="31" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">
            {x.targetNumbers != undefined ? x.targetNumbers[0] : ""}
        </text>
        <text x="87" y="31" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">
            {x.targetNumbers != undefined ? x.targetNumbers[1] : ""}
        </text>
      </svg>
      </div>
    ) });
    

    // $.box.appearance({render: x=> ( <div /> )})

    game.all(Hand).appearance({
      render: () => (
        <div className='Hand' />
      ),
    });
    game.all(Table).appearance({
      render: () => (
        <div className='Table' />
      ),
    });
    game.all(Trash).appearance({
      render: () => (
        <div className='Trash' />
      ),
    });
    game.all(PlayersSpace).appearance({
      render: () => (
        <div className='PlayersSpace' />
      ),
    });

    game.all(TheVoid).appearance({ render: x => ( 
      <div className='TheVoid' />
    ) });


    game.all(Reference).appearance({ render: x => ( 
      <div className='Reference' />
    ) });
    game.all(TurnReference).appearance({ render: x => ( 
      <div className='TurnReference' />
    ) });
    game.all(ScoreReference).appearance({ render: x => ( 
      <div className='ScoreReference' />
    ) });

    let refTabSpaces: Record<string, Space<MyGame> | string> = {};
      let refTabDefs: Record<string, React.ReactNode> = {};

      refTabSpaces['Turn Reference'] = $.turnRef as Space<MyGame>;
      refTabSpaces['Score Reference'] = $.scoreRef as Space<MyGame>;

      const reftab1 = (
          <div>          
            <div className='playerTab'>
              Turn Reference
            </div>
          </div>
        );
        const reftab2 = (
          <div>          
            <div className='playerTab'>
              Score Reference
            </div>
          </div>
        );
        refTabDefs['Turn Reference']  = reftab1;
        refTabDefs['Score Reference']  = reftab2;

      $.reference.layoutAsTabs(refTabSpaces,
        { area: { left: 5, top: 0 , width: 100, height:100 }, tabDirection: 'left', tabs: refTabDefs
      })

    game.layoutAsDrawer($.reference as Space<MyGame>, 
      { area: { left: 20, top: 0, width: 80, height: 100 }, openDirection: 'left', tab: 'Reference' }
     );


  }
});
