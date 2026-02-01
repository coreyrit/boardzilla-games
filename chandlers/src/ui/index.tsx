import React from 'react';
import { Piece, render, Space, toggleSetting } from '@boardzilla/core';
import { Color, MyGame, default as setup } from '../game/index.js';

import './style.scss';
import { BackAlleyTile, CandlePawn, ColorDie, CustomerCard, EndGameTile, KeyShape, RoundEndTile, Wax, PowerTile, Melt, MasteryCube, Pigment, ScoreTracker, Bulb, GoalCard, Lamp, WorkerPiece, Trash, Check, CaptureTile, PlayerOrderCube } from '../game/components.js';
import { BackAlley, BackAlleySpace, Candelabra, CandleBottomRow, CandleSpace, CandleTopRow, ChandlersBoard, CheckSpace, ComponentSpace, CustomerCubeSpace, CustomerSpace, DiceSpace, GameEndSpace, KeyHook, MasterySpace, MasteryTrack, PlayerBoard, PlayerOrderSpace, PlayerSpace, PlayersSpace, PowerSpace, ReadySpace, RoundEndSpace, RoundSpace, ScoringSpace, ScoringTrack, Spill, WorkerSpace } from '../game/boards.js';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    // captureWorkers: toggleSetting('Capture workers when stacking')
  },
  layout: game => {
    // const LEFT_POSITION_OFFSET = 25;
    const LEFT_POSITION_OFFSET = 0;

    game.appearance({
      render: () => null
    });

    game.layout('board', { area: { left: -25 + LEFT_POSITION_OFFSET, top: 0, width: 150, height: 100 }});
    
    game.layoutAsDrawer($.playersSpace as Space<MyGame>, 
      { area: { left: -25 + LEFT_POSITION_OFFSET, top: 50, width: 150, height: 50 }, openDirection: 'up', tab: 'Players',
      openIf: actions => actions.some(a => 
        [
          'chooseWorker',
          'chooseMeltRed', 'chooseMeltYellow', 'chooseMeltBlue', 'chooseMeltManyRed', 'chooseMeltManyYellow', 'chooseMeltManyBlue',
          'chooseRedOrWhiteMelt', 'chooseYellowOrWhiteMelt', 'chooseBlueOrWhiteMelt', 'chooseOrangeOrBlackMelt', 'chooseGreenOrBlackMelt', 'choosePurpleOrBlackMelt', 
          'chooseWax',
          'chooseSpiltPigment', 'chooseMelt', 'chooseCandlesToTrade',
          'discardExtraComponents', 'discardExtraCustomers', 'discardExtraGoals',
          'chooseWaxRepeater', 'chooseCandleToMove', 'choosePowerTile',
          'choosePigmentsToRemove', 'chooseWhiteCandle', 'chooseCustomerToSwap', 'chooseKeyAndShape',
          'chooseStartingCustomer', 'chooseStartingGoal', 'usePower',
          'chooseMeltToMixInto', 'chooseMeltToMixIntoFromMastery',
          'choosePassAction', 'chooseGoal'
        ]
        .includes(a.name)),
      closeIf: actions => actions.some(a => 
          [
            'chooseSpiltPigmentToMix', 'chooseKey',
            'chooseBackAlleyAction',  // 'chooseDieFromBoard',
            'chooseBackroomAction', 'chooseSpiltPigment',
            'choosePigmentColor'
          ]
          .includes(a.name)  || (a.name == 'placeWorker') && !($.ready.first(WorkerPiece) instanceof CandlePawn)
          ),
      });


      var index = 0;
      let tabSpaces: Record<string, Space<MyGame> | string> = {};
      let tabDefs: Record<string, React.ReactNode> = {};
      game.players.forEach(x => {
        tabSpaces['player' + index] = x.space;
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

    game.layoutAsTabs

    game.layout('goalDeck', { area: { left: 0 + LEFT_POSITION_OFFSET, top: 0, width: 0, height: 0 }});

    game.layout('drawCustomer', { area: { left: -19.5 + LEFT_POSITION_OFFSET, top: 6, width: 20.5, height: 13.5 }});
    game.layout('customer1', { area: { left: 5.5 + LEFT_POSITION_OFFSET, top: 6, width: 19.5, height: 13.5 }});
    game.layout('customer2', { area: { left: 25.5 + LEFT_POSITION_OFFSET, top: 6, width: 19.5, height: 13.5 }});
    game.layout('customer3', { area: { left: 5.5 + LEFT_POSITION_OFFSET, top: 20.5, width: 19.5, height: 13.5 }});
    game.layout('customer4', { area: { left: 25.5 + LEFT_POSITION_OFFSET, top: 20.5, width: 19.5, height: 13.5 }});

    game.layout('waxRed', { area: { left: -18.5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('waxYellow', { area: { left: -5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('waxBlue', { area: { left: 8 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('waxOrange', { area: { left: -18.5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('waxGreen', { area: { left: -5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('waxPurple', { area: { left: 8 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('waxRepeater', { area: { left: -7.5 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('waxMiddle', { area: { left: -0.5 + LEFT_POSITION_OFFSET, top: 65, width: 5, height: 5 }});
    game.layout('waxBackroom', { area: { left: 6.5 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('waxSpill', { area: { left: -16.5 + LEFT_POSITION_OFFSET, top: 79.5, width: 5, height: 5 }});

    game.layout('pigmentRed', { area: { left: 30 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('pigmentYellow', { area: { left: 43.5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('pigmentBlue', { area: { left: 56.5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('pigmentOrange', { area: { left: 30 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentGreen', { area: { left: 43.5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentPurple', { area: { left: 56.5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentRepeater', { area: { left: 41 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('pigmentMiddle', { area: { left: 48 + LEFT_POSITION_OFFSET, top: 65, width: 5, height: 5 }});
    game.layout('pigmentBackroom', { area: { left: 55 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('pigmentSpill', { area: { left: 32.5 + LEFT_POSITION_OFFSET, top: 79.5, width: 5, height: 5 }});

    game.layout('moldRed', { area: { left: 78.5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('moldYellow', { area: { left: 92 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('moldBlue', { area: { left: 105.5 + LEFT_POSITION_OFFSET, top: 36, width: 5, height: 5 }});
    game.layout('moldOrange', { area: { left: 78.5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('moldGreen', { area: { left: 92 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('moldPurple', { area: { left: 105.5 + LEFT_POSITION_OFFSET, top: 49.5, width: 5, height: 5 }});
    game.layout('moldRepeater', { area: { left: 89.5 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('moldMiddle', { area: { left: 96.5 + LEFT_POSITION_OFFSET, top: 65, width: 5, height: 5 }});
    game.layout('moldBackroom', { area: { left: 103.5 + LEFT_POSITION_OFFSET, top: 64, width: 5, height: 5 }});
    game.layout('moldSpill', { area: { left: 81 + LEFT_POSITION_OFFSET, top: 79.5, width: 5, height: 5 }});

    game.layout('whiteCandles', { area: { left: 45 + LEFT_POSITION_OFFSET, top: 6, width: 9, height: 22 }});
    game.layout('redCandles', { area: { left: 54.5 + LEFT_POSITION_OFFSET, top: 10.5, width: 9, height: 17.5 }});
    game.layout('yellowCandles', { area: { left: 64 + LEFT_POSITION_OFFSET, top: 11, width: 9, height: 17.5 }});
    game.layout('blueCandles', { area: { left: 73.5 + LEFT_POSITION_OFFSET, top: 11, width: 9, height: 17.5 }});
    game.layout('orangeCandles', { area: { left: 82.5 + LEFT_POSITION_OFFSET, top: 11, width: 9, height: 17.5 }});
    game.layout('greenCandles', { area: { left: 92 + LEFT_POSITION_OFFSET, top: 11, width: 9, height: 17.5 }});
    game.layout('purpleCandles', { area: { left: 101.5 + LEFT_POSITION_OFFSET, top: 11, width: 9, height: 17.5 }});
    game.layout('blackCandles', { area: { left: 110.5 + LEFT_POSITION_OFFSET, top: 14.5, width: 9, height: 14 }});

    game.layout('whiteType', { area: { left: 45.5 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('redType', { area: { left: 55 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('yellowType', { area: { left: 64.5 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('blueType', { area: { left: 74 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('orangeType', { area: { left: 83.5 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('greenType', { area: { left: 92.5 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('purpleType', { area: { left: 102 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});
    game.layout('blackType', { area: { left: 111.5 + LEFT_POSITION_OFFSET, top: 30, width: 8, height: 4.5 }});

    game.layout('gameEndType1', { area: { left: -12 + LEFT_POSITION_OFFSET, top: 21, width: 8, height: 4.5 }});
    game.layout('gameEndType2', { area: { left: -12 + LEFT_POSITION_OFFSET, top: 25.6, width: 8, height: 4.5 }});
    game.layout('gameEndType3', { area: { left: -12 + LEFT_POSITION_OFFSET, top: 30.25, width: 8, height: 4.5 }});

    game.layout('round1', { area: { left: 84.5 + LEFT_POSITION_OFFSET, top: 6, width: 5, height: 5 }});
    game.layout('round2', { area: { left: 93 + LEFT_POSITION_OFFSET, top: 6, width: 5, height: 5 }});
    game.layout('round3', { area: { left: 101.5 + LEFT_POSITION_OFFSET, top: 6, width: 5, height: 5 }});
    // game.layout('round4', { area: { left: 102.5 + LEFT_OFFSET, top: 6, width: 5, height: 5 }});

    game.layout('roundEndSpace1', { area: { left: -19.5 + LEFT_POSITION_OFFSET, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace2', { area: { left: -1 + LEFT_POSITION_OFFSET, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace3', { area: { left: 17 + LEFT_POSITION_OFFSET, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace4', { area: { left: 35.5 + LEFT_POSITION_OFFSET, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace5', { area: { left: 54 + LEFT_POSITION_OFFSET, top: 88, width: 16.6, height: 6.5 }});

    game.layout('playerOrder1', { area: { left: 2.1 + LEFT_POSITION_OFFSET, top: 10, width: 2.5, height: 2.5 }});
    game.layout('playerOrder2', { area: { left: 2.1 + LEFT_POSITION_OFFSET, top: 12.7, width: 2.5, height: 2.5 }});
    game.layout('playerOrder3', { area: { left: 2.1 + LEFT_POSITION_OFFSET, top: 15.4, width: 2.5, height: 2.5 }});
    game.layout('playerOrder4', { area: { left: 2.1 + LEFT_POSITION_OFFSET, top: 18.1, width: 2.5, height: 2.5 }});

    game.layout('playerOrderPass1', { area: { left: 1.3 + LEFT_POSITION_OFFSET, top: 24, width: 2.5, height: 2.5 }});
    game.layout('playerOrderPass2', { area: { left: 1.3 + LEFT_POSITION_OFFSET, top: 26.7, width: 2.5, height: 2.5 }});
    game.layout('playerOrderPass3', { area: { left: 1.3 + LEFT_POSITION_OFFSET, top: 29.4, width: 2.5, height: 2.5 }});
    game.layout('playerOrderPass4', { area: { left: 1.3 + LEFT_POSITION_OFFSET, top: 32.1, width: 2.5, height: 2.5 }});

    game.layout('bag', { area: { left: 0 + LEFT_POSITION_OFFSET, top: 0, width: 0, height: 0 }});
    
    game.layout('backAlleySpaceA1', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 36, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA2', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 43, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA3', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 50, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA4', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 57, width: 6.5, height: 6.5 }});
    
    game.layout('backAlleyA', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 67, width: 6.5, height: 6.5 }});

    game.layout('backAlleySpaceB1', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 36, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB2', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 43, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB3', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 50, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB4', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 57, width: 6.5, height: 6.5 }});

    game.layout('backAlleyB', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 67, width: 6.5, height: 6.5 }});

    game.layout('waxBackAlleySpaceA', { area: { left: 14 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('waxBackroomCheckSpace', { area: { left: 20.5 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});

    game.layout('pigmentBackAlleySpaceA', { area: { left: 56.5 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('pigmentBackAlleySpaceB', { area: { left: 63.5 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('pigmentBackroomCheckSpace', { area: { left: 70 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});

    game.layout('moldBackAlleySpaceB', { area: { left: 111.5 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('moldBackroomCheckSpace', { area: { left: 118 + LEFT_POSITION_OFFSET, top: 69.5, width: 6.5, height: 6.5 }});

    game.layout('ready', { area: { left: 112 + LEFT_POSITION_OFFSET, top: 7, width: 6.5, height: 6.5 }});

    game.layout('waxSpillArea', { area: { left: -10 + LEFT_POSITION_OFFSET, top: 78, width: 20, height: 9 }});    
    game.layout('meltSpillArea', { area: { left: 87.5 + LEFT_POSITION_OFFSET, top: 78, width: 25, height: 9 }});

    game.layout('alleyACheckSpace', { area: { left: 22.5 + LEFT_POSITION_OFFSET, top: 66.5, width: 6.5, height: 6.5 }});
    game.layout('alleyBCheckSpace', { area: { left: 71 + LEFT_POSITION_OFFSET, top: 66.5, width: 6.5, height: 6.5 }});

    game.all(ChandlersBoard).appearance({
      render: () => (
        <div>
          <div className="front"/>
        </div>
      ),
    });

    game.all(Wax).appearance({
      render: () => (
        <div className='Wax' />
      ),
    });

    game.all(Bulb).appearance({
      render: () => (
        <div className='Bulb' />
      ),
    });

    game.all(Trash).appearance({
      render: () => (
        <div className='Trash' />
      ),
    });

    game.all(Check).appearance({
      render: x => (
        <div className='Check'>
          <div className={x.flipped ? 'front' : 'back'} />
        </div>
      ),
    });

    game.all(Lamp).appearance({
      render: () => (
        <div className='Lamp' />
      ),
    });    

    game.all(Melt).appearance({
      render: x => (
        <div className='Melt'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>
            <ellipse cx="50" cy="30" rx="40" ry="30" fill='currentColor'/>
          </svg>
        </div>
      ),
    });

    game.all(CandlePawn).appearance({
      render: x => (
        <div className='CandlePawn'>
          <div className={x.color}/>
        </div>
      ),
    });

    game.all(KeyShape).appearance({
      render: () => (
        <div className='KeyShape'>
          <div className="front"/>
        </div>
      ),
    });

    game.all(CustomerSpace).appearance({
      render: () => (
        <div className='CustomerSpace'>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="70" /> */}
        </svg>
        </div>
      ),
    });

    game.all(Candelabra).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    $.whiteCandles.layout(Piece, {columns: 2, rows: 5, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.redCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.yellowCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.blueCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.orangeCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.greenCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.purpleCandles.layout(Piece, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.blackCandles.layout(Piece, {columns: 2, rows: 3, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})

    game.all(KeyHook).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    game.all(PowerSpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    game.layout('redHook', { area: { left: 84 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});
    game.layout('blueHook', { area: { left: 93.5 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});
    game.layout('yellowHook', { area: { left: 89 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});
    game.layout('orangeHook', { area: { left: 97.5 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});
    game.layout('greenHook', { area: { left: 102 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});
    game.layout('purpleHook', { area: { left: 106.5 + LEFT_POSITION_OFFSET, top: 90, width: 6, height: 6 }});

    game.layout('pigmentMasteryArea', { area: { left: 31 + LEFT_POSITION_OFFSET, top: 70, width: 12.5, height: 4.5 }});
    game.layout('pigmentSpillArea', { area: { left: 37.5 + LEFT_POSITION_OFFSET, top: 78, width: 22.5, height: 9 }});
    game.layout('pigmentSpillCheckSpace', { area: { left: 31.75 + LEFT_POSITION_OFFSET, top: 76.5, width: 6.5, height: 6.5 }});

    game.layout('pigmentMasteryCheckSpace', { area: { left: 43 + LEFT_POSITION_OFFSET, top: 69, width: 6.5, height: 6.5 }});

    game.all(Spill).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    $.pigmentMasteryArea.layout(Pigment, {columns: 3, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill', alignment: 'top', direction: 'ltr'})

    $.waxSpillArea.layout(Wax, {columns: 4, rows: 2, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'top', direction: 'ltr'})
    $.pigmentSpillArea.layout(Pigment, {columns: 5, rows: 2, gap: {x:0, y: 0}, scaling: 'fill', alignment: 'top', direction: 'ltr'})
    $.meltSpillArea.layout(Melt, {
      columns: 3, 
      rows: 2, 
      // gap: {x:1.5, y: 0}, 
      offsetRow: {x: -50, y: 100}, 
      offsetColumn: 110, 
      scaling: 'fill', 
      alignment: 'center', 
      direction: 'ltr-btt'
    })

    game.all(Pigment).appearance({
      render: x => (
        <div className='Pigment'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>
            <circle cx="50" cy="50" r={x.color == undefined ? '0' : '50'} fill='currentColor'/>
          </svg>
        </div>
      ),
    });

    game.all(WorkerSpace).appearance({ render: x => ( 
      <div className='WorkerSpace'>
        <br /><br /><br /><br />
        <h1><span>{x.toHtml()}</span></h1>
      </div>
    ) });

    game.all(DiceSpace).appearance({ render: x => ( 
      <div className='DiceSpace' />
    ) });

    game.all(ComponentSpace).appearance({ render: x => ( 
      <div className='ComponentSpace'>
            {/* <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" />
            </svg> */}
      </div>
    ) });

    game.all(ReadySpace).appearance({ render: x => ( 
      <div className='ReadySpace'>
            {/* <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" />
            </svg> */}
      </div>
    ) });

    game.all(GameEndSpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="55" /> */}
        </svg>
      ),
    });

    game.all(RoundSpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    game.all(RoundEndSpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="40" /> */}
        </svg>
      ),
    });

    game.all(PlayerOrderSpace).appearance({
      render: x => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="100" height="100" stroke='black'
            strokeWidth={!x.pass && game.playerTurn == x.num ? '30' : '0'} fillOpacity='0'/>
        </svg>
      ),
    });

    game.all(BackAlleySpace).appearance({
      render: () => (
        <div className='BackAlleySpace'>
        {/* <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg> */}
        </div>
      ),
    });

    game.all(CheckSpace).appearance({
      render: () => (
        <div className='CheckSpace'>
        {/* <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg> */}
        </div>
      ),
    });

    game.all(BackAlley).appearance({ render: x => ( 
      <div className='BackAlley'>
            {/* <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" />
            </svg> */}
      </div>
    ) });

    game.all(MasteryTrack).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="40" /> */}
        </svg>
      ),
    });

    game.all(MasterySpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="100" height="100" fill="currentColor" opacity='0' />
        </svg>
      ),
    });

    game.all(MasteryCube).appearance({
      render: x => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color == undefined ? "white" : x.player!.color}>
          <rect x="0" y="0" width="100" height="100" fill="currentColor" opacity={x.color == undefined ? '0' : '100'}/>
        </svg>
      ),
    });

    game.all(PlayerOrderCube).appearance({
      render: x => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color == undefined ? "white" : x.player!.color}>
          <rect x="10" y="10" width="80" height="80" fill="currentColor" opacity={x.color == undefined ? '0' : '100'}/>
        </svg>
      ),
    });

    $.drawCustomer.layout(CustomerCard, {
      offsetColumn: {x: 0, y: 0},
      alignment: 'left',
      margin: {top: 0, bottom: 0, left: 0, right:1}
    });

    $.drawCustomer.appearance({ render: x => ( 
      <div className='CustomerCard'>
        <br /><br /><br /><br />
        <h2><span>{game.deckSize()}</span></h2>
      </div>
    ) });
    
    game.all(WorkerSpace).layout(KeyShape, {
      offsetColumn: {x: 0, y: 0},
        alignment: 'left'
      });
    game.all(WorkerSpace).layout(ColorDie, {
    offsetColumn: {x: 0, y: 0},
      alignment: 'left'
    });
    game.all(WorkerSpace).layout(CandlePawn, {
      offsetColumn: {x: 0, y: 0},
        alignment: 'left'
      });

    game.all(BackAlleySpace).layout(BackAlleyTile, {
      offsetColumn: {x: 0, y: 0},
        alignment: 'left'
      });

    game.all(CustomerCard).appearance({ render: x => ( 
      <div className='CustomerCard'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(CustomerCubeSpace).appearance({ render: x => ( 
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color="black">
          <rect x="0" y="0" width="100" height="100" fill="currentColor" opacity={!x.used ? '0' : '100'}/>
        </svg>
    ) })

    game.all(GoalCard).appearance({ render: x => ( 
      <div className='GoalCard'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(EndGameTile).appearance({ render: x => ( 
      <div className='EndGameTile'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(PowerTile).appearance({ render: x => ( 
      <div className='PowerTile'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(CaptureTile).appearance({ render: x => ( 
      <div className='CaptureTile'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(RoundEndTile).appearance({ render: x => ( 
      <div className='RoundEndTile'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });
    
    game.all(BackAlleyTile).appearance({ render: x => ( 
      <div className='BackAlleyTile'>
        <div className={x.flipped ? 'front' : 'back'} />
      </div>
    ) });

    game.all(ColorDie).appearance({ render: x => ( 
      <div className='ColorDie'>
        <div className={x.color} />
      </div>
    ) });

    game.all(PlayersSpace).appearance({ render: x => ( 
      <div className='PlayersSpace'>
        <svg />
      </div>
    ) });

    game.all(PlayerSpace).appearance({ render: x => ( 
      <div className='PlayerSpace'>
        <svg />
      </div>
    ) });
    game.all(PlayerBoard).appearance({ 
      render: x => ( 
      <div className='PlayerBoard'>
        <div className='front' />
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.player!.color}>
          <rect x="0" y="4" width="100" height="60" fill="white" />
          <rect x="0" y="4" width="100" height="60" fill="currentColor" opacity='75%'/>
        </svg>
      </div>
    ) });

    
    game.players.forEach(x => {
      x.space.layout(x.board, { area: { left: 50, top: 10, width: 30, height: 80 }});
      x.board.layout(x.board.first(CustomerSpace)!, { area: { left: 65, top: 40, width: 33, height: 45 }});
      x.board.layout(x.board.first(MasteryTrack)!, {area: { left: 0, top: 0, width: 100, height: 100 }});

      x.space.layout(CustomerCard, { 
        area: { left: 5, top: 2, width: 40, height: 96 },
        rows: 3,
        columns: 3,
        gap: {x: 0.5, y: 0.5},
      });

      x.space.layout(Lamp, { 
        area: { left: -1, top: 60, width: 8, height: 40 },
      });

      x.space.layout(CaptureTile, { 
        area: { left: 90, top: 60, width: 5, height: 20 },
      });

      x.space.layout(GoalCard, { 
        area: { left: 81, top: 2, width: 18, height: 96 },
        rows: 3,
        columns: 3,
        gap: {x: 0.5, y: 0.5},
      });

      x.board.first(MasteryTrack)!.layout(MasterySpace, { 
        area: { left: 3, top: 20, width: 90, height: 7 },
        rows: 1,
        columns: 16,
        gap: {x: 0.25, y: 0},
        direction: 'ltr',
      });

      index++;
    })

    game.all(ScoringTrack).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });
    game.all(ScoringSpace).appearance({
      render: () => (
        <svg />
      ),
    });

    game.layout('scoringTrack1_20', { 
      area: { left: -22.75 + LEFT_POSITION_OFFSET, top: 2, width: 3, height: 93 }
    });
    game.layout('scoringTrack21_50', { 
      area: { left: -19.75 + LEFT_POSITION_OFFSET, top: 2, width: 142.50, height: 3 }
    });
    game.layout('scoringTrack51_70', { 
      area: { left: 120 + LEFT_POSITION_OFFSET, top: 5, width: 3, height: 93 }
    });
    game.layout('scoringTrack71_100', { 
      area: { left: -22.75 + LEFT_POSITION_OFFSET, top: 95, width: 142.50, height: 3 }
    });
    $.scoringTrack1_20.layout(ScoringSpace, {     
      rows: 20,
      columns: 1,
      gap: {x: 0, y: 0},
      direction: 'btt',
    });
    $.scoringTrack21_50.layout(ScoringSpace, {     
      rows: 1,
      columns: 30,
      gap: {x: 0, y: 0},
      direction: 'ltr',
    });
    $.scoringTrack51_70.layout(ScoringSpace, {     
      rows: 20,
      columns: 1,
      gap: {x: 0, y: 0},
      direction: 'ttb',
    });
    $.scoringTrack71_100.layout(ScoringSpace, {     
      rows: 1,
      columns: 30,
      gap: {x: 0, y: 0},
      direction: 'rtl',
    });

    game.all(CustomerCard).forEach(x => {
      if(x.data != "") {
        for (const candleRow of [x.first(CandleTopRow)!, x.first(CandleBottomRow)!]) {
          const numSpaces = candleRow.all(CandleSpace).length;

          var width = 0;
          switch(numSpaces) {
            case 1: { width = 20; break; }
            case 2: { width = 50; break; }
            case 3: { width = 60; break; }
            case 4: { width = 80; break; }
          }

          if(candleRow.name.includes('topRow')) {
            x.layout(CandleTopRow, { 
              area: { left: (100-width)/2-5, top: 23, width: width, height: 25 },
            });
          } else {
            x.layout(CandleBottomRow, { 
              area: { left: (100-width)/2-5, top: 48, width: width, height: 25 },
            });
          }
        }
      }
      x.layout(CustomerCubeSpace, {
        area: { left: 15, top: 75, width: 20, height: 20 }
      })
    });    
    game.all(CandleTopRow).layout(CandleSpace, {
      rows: 1
    }); 
    game.all(CandleBottomRow).layout(CandleSpace, {
      rows: 1
    }); 

    game.all(CandleTopRow).appearance({
      render: x => (
        <svg />
      ),
    });
    
    game.all(CandleBottomRow).appearance({
      render: x => (
        <svg />
      ),
    });
    game.all(CandleSpace).appearance({
      render: () => (
        <div className='CandleSpace' />
      ),
    });
    
    game.all(ScoreTracker).appearance({
      render: x => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color == undefined ? "white" : x.player!.color}>
          <circle cx="50" cy="50" r="50"fill="currentColor" stroke="white" strokeWidth="5" opacity={x.color == undefined ? '0' : '100'}/>
          <text x="8" y="65" fontSize="50" fill="white">{x.flipped ? '100' : ''}</text>
        </svg>
      ),
    });

    game.players.forEach(x => {
      const dieSpaces = x.board.all(DiceSpace);
      x.board.layout(dieSpaces[0], { area: { left: 22, top: 71, width: 10, height: 15 }});
      x.board.layout(dieSpaces[1], { area: { left: 34.5, top: 71, width: 10, height: 15 }});
      x.board.layout(dieSpaces[2], { area: { left: 47, top: 71, width: 10, height: 15 }});
      // x.board.layout(dieSpaces[3], { area: { left: 53.5, top: 71, width: 10, height: 15 }});

      const compSpaces = x.board.all(ComponentSpace);
      x.board.layout(compSpaces[0], { area: { left: 15, top: 40, width: 10, height: 10 }});
      x.board.layout(compSpaces[1], { area: { left: 27, top: 40, width: 10, height: 10 }});
      x.board.layout(compSpaces[2], { area: { left: 40, top: 40, width: 10, height: 10 }});
      x.board.layout(compSpaces[3], { area: { left: 52, top: 40, width: 10, height: 10 }});
      x.board.layout(compSpaces[4], { area: { left: 15, top: 57, width: 10, height: 10 }});
      x.board.layout(compSpaces[5], { area: { left: 27, top: 57, width: 10, height: 10 }});
      x.board.layout(compSpaces[6], { area: { left: 40, top: 57, width: 10, height: 10 }});
      x.board.layout(compSpaces[7], { area: { left: 52, top: 57, width: 10, height: 10 }});

      for(var i = 8; i < 20; i++) {
        x.board.layout(compSpaces[i], { area: { left: 30+(9-i)*10, top: 95, width: 10, height: 10 }});
      }
      
      const powerSpaces = x.board.all(PowerSpace);
      x.board.layout(powerSpaces[0], { area: { left: 2.5, top: 38, width: 10, height: 15 }});
      x.board.layout(powerSpaces[1], { area: { left: 2.5, top: 55, width: 10, height: 15 }});
      x.board.layout(powerSpaces[2], { area: { left: 2.5, top: 72, width: 10, height: 15 }});
    })

    game.layoutControls({
      element: game,
      top: 0,
      center: -5 + LEFT_POSITION_OFFSET,
      width: 30
    });
  }
  
});
