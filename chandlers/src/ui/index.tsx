import React from 'react';
import { render } from '@boardzilla/core';
import { BackAlleySpace, BackAlleyTile, Candelabra, CandlePawn, ChandlersBoard, ColorDie, ComponentSpace, CustomerCard, CustomerSpace, DiceSpace, EndGameTile, GameEndSpace, KeyHook, KeyShape, MasteryCube, MasteryTrack, Melt, Pigment, PlayerBoard, PlayerSpace, PowerSpace, PowerTile, ReadySpace, RoundEndSpace, RoundEndTile, Spill, Wax, WorkerSpace, default as setup } from '../game/index.js';

import './style.scss';
// import '@boardzilla/core/index.css';

render(setup, {
  settings: {
  },
  layout: game => {

    game.appearance({
      render: () => null
    });

    game.layout('board', { area: { left: -25, top: 0, width: 150, height: 100 }});

    game.layout('playerSpace', { area: { left: -25, top: 60, width: 150, height: 40 },
      drawer: { closeDirection: 'down', tab: () => 'Player' }});

    game.layout('drawCustomer', { area: { left: -19.5, top: 6, width: 19.5, height: 13.5 }});
    game.layout('customer1', { area: { left: 5.5, top: 6, width: 19.5, height: 13.5 }});
    game.layout('customer2', { area: { left: 25.5, top: 6, width: 19.5, height: 13.5 }});
    game.layout('customer3', { area: { left: 5.5, top: 20.5, width: 19.5, height: 13.5 }});
    game.layout('customer4', { area: { left: 25.5, top: 20.5, width: 19.5, height: 13.5 }});

    game.layout('waxRed', { area: { left: -18.5, top: 36, width: 5, height: 5 }});
    game.layout('waxYellow', { area: { left: -5, top: 36, width: 5, height: 5 }});
    game.layout('waxBlue', { area: { left: 8, top: 36, width: 5, height: 5 }});
    game.layout('waxOrange', { area: { left: -18.5, top: 49.5, width: 5, height: 5 }});
    game.layout('waxGreen', { area: { left: -5, top: 49.5, width: 5, height: 5 }});
    game.layout('waxPurple', { area: { left: 8, top: 49.5, width: 5, height: 5 }});
    game.layout('waxRepeater', { area: { left: -7.5, top: 64, width: 5, height: 5 }});
    game.layout('waxMiddle', { area: { left: -0.5, top: 65, width: 5, height: 5 }});
    game.layout('waxBackroom', { area: { left: 6.5, top: 64, width: 5, height: 5 }});
    game.layout('waxSpill', { area: { left: -16.5, top: 79.5, width: 5, height: 5 }});

    game.layout('pigmentRed', { area: { left: 30, top: 36, width: 5, height: 5 }});
    game.layout('pigmentYellow', { area: { left: 43.5, top: 36, width: 5, height: 5 }});
    game.layout('pigmentBlue', { area: { left: 56.5, top: 36, width: 5, height: 5 }});
    game.layout('pigmentOrange', { area: { left: 30, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentGreen', { area: { left: 43.5, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentPurple', { area: { left: 56.5, top: 49.5, width: 5, height: 5 }});
    game.layout('pigmentRepeater', { area: { left: 41, top: 64, width: 5, height: 5 }});
    game.layout('pigmentMiddle', { area: { left: 48, top: 65, width: 5, height: 5 }});
    game.layout('pigmentBackroom', { area: { left: 55, top: 64, width: 5, height: 5 }});
    game.layout('pigmentSpill', { area: { left: 32.5, top: 79.5, width: 5, height: 5 }});

    game.layout('moldRed', { area: { left: 78.5, top: 36, width: 5, height: 5 }});
    game.layout('moldYellow', { area: { left: 92, top: 36, width: 5, height: 5 }});
    game.layout('moldBlue', { area: { left: 105.5, top: 36, width: 5, height: 5 }});
    game.layout('moldOrange', { area: { left: 78.5, top: 49.5, width: 5, height: 5 }});
    game.layout('moldGreen', { area: { left: 92, top: 49.5, width: 5, height: 5 }});
    game.layout('moldPurple', { area: { left: 105.5, top: 49.5, width: 5, height: 5 }});
    game.layout('moldRepeater', { area: { left: 89.5, top: 64, width: 5, height: 5 }});
    game.layout('moldMiddle', { area: { left: 96.5, top: 65, width: 5, height: 5 }});
    game.layout('moldBackroom', { area: { left: 103.5, top: 64, width: 5, height: 5 }});
    game.layout('moldSpill', { area: { left: 81, top: 79.5, width: 5, height: 5 }});

    game.layout('whiteCandles', { area: { left: 45, top: 6, width: 9, height: 22 }});
    game.layout('redCandles', { area: { left: 54.5, top: 10.5, width: 9, height: 17.5 }});
    game.layout('yellowCandles', { area: { left: 64, top: 11, width: 9, height: 17.5 }});
    game.layout('blueCandles', { area: { left: 73.5, top: 11, width: 9, height: 17.5 }});
    game.layout('orangeCandles', { area: { left: 82.5, top: 11, width: 9, height: 17.5 }});
    game.layout('greenCandles', { area: { left: 92, top: 11, width: 9, height: 17.5 }});
    game.layout('purpleCandles', { area: { left: 101.5, top: 11, width: 9, height: 17.5 }});
    game.layout('blackCandles', { area: { left: 110.5, top: 14.5, width: 9, height: 14 }});

    game.layout('whiteType', { area: { left: 45.5, top: 30, width: 8, height: 4.5 }});
    game.layout('redType', { area: { left: 55, top: 30, width: 8, height: 4.5 }});
    game.layout('yellowType', { area: { left: 64.5, top: 30, width: 8, height: 4.5 }});
    game.layout('blueType', { area: { left: 74, top: 30, width: 8, height: 4.5 }});
    game.layout('orangeType', { area: { left: 83.5, top: 30, width: 8, height: 4.5 }});
    game.layout('greenType', { area: { left: 92.5, top: 30, width: 8, height: 4.5 }});
    game.layout('purpleType', { area: { left: 102, top: 30, width: 8, height: 4.5 }});
    game.layout('blackType', { area: { left: 111.5, top: 30, width: 8, height: 4.5 }});

    game.layout('gameEndType1', { area: { left: -12, top: 21, width: 8, height: 4.5 }});
    game.layout('gameEndType2', { area: { left: -12, top: 25.6, width: 8, height: 4.5 }});
    game.layout('gameEndType3', { area: { left: -12, top: 30.25, width: 8, height: 4.5 }});

    game.layout('roundEndSpace1', { area: { left: -19.5, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace2', { area: { left: -1, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace3', { area: { left: 17, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace4', { area: { left: 35.5, top: 88, width: 16.6, height: 6.5 }});
    game.layout('roundEndSpace5', { area: { left: 54, top: 88, width: 16.6, height: 6.5 }});

    game.layout('bag', { area: { left: 0, top: 0, width: 0, height: 0 }});
    
    game.layout('backAlleySpaceA1', { area: { left: 22.5, top: 36, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA2', { area: { left: 22.5, top: 43, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA3', { area: { left: 22.5, top: 50, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceA4', { area: { left: 22.5, top: 57, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB1', { area: { left: 71, top: 36, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB2', { area: { left: 71, top: 43, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB3', { area: { left: 71, top: 50, width: 6.5, height: 6.5 }});
    game.layout('backAlleySpaceB4', { area: { left: 71, top: 57, width: 6.5, height: 6.5 }});
    game.layout('waxBackAlleySpaceA', { area: { left: 14, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('pigmentBackAlleySpaceA', { area: { left: 56.5, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('pigmentBackAlleySpaceB', { area: { left: 63.5, top: 69.5, width: 6.5, height: 6.5 }});
    game.layout('moldBackAlleySpaceB', { area: { left: 111.5, top: 69.5, width: 6.5, height: 6.5 }});

    game.layout('ready', { area: { left: 112, top: 7, width: 6.5, height: 6.5 }});

    game.layout('waxSpillArea', { area: { left: -10, top: 78, width: 20, height: 9 }});    
    game.layout('meltSpillArea', { area: { left: 87.5, top: 78, width: 25, height: 9 }});

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
      render: () => (
        <div className='CandlePawn'>
          <div className="front"/>
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
          <rect x="0" y="0" width="100" height="70" />
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

    $.whiteCandles.layout(CandlePawn, {columns: 2, rows: 5, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.redCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.yellowCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.blueCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.orangeCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.greenCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.purpleCandles.layout(CandlePawn, {columns: 2, rows: 4, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})
    $.blackCandles.layout(CandlePawn, {columns: 2, rows: 3, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'bottom', direction: 'ltr-btt'})

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

    game.layout('redHook', { area: { left: 84, top: 90, width: 6, height: 6 }});
    game.layout('blueHook', { area: { left: 93.5, top: 90, width: 6, height: 6 }});
    game.layout('yellowHook', { area: { left: 89, top: 90, width: 6, height: 6 }});
    game.layout('orangeHook', { area: { left: 97.5, top: 90, width: 6, height: 6 }});
    game.layout('greenHook', { area: { left: 102, top: 90, width: 6, height: 6 }});
    game.layout('purpleHook', { area: { left: 106.5, top: 90, width: 6, height: 6 }});

    game.layout('pigmentSpillArea', { area: { left: 37.5, top: 78, width: 22.5, height: 9 }});

    game.all(Spill).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="100" /> */}
        </svg>
      ),
    });

    $.waxSpillArea.layout(Wax, {columns: 4, rows: 2, gap: {x: 0, y: 0}, scaling: 'fill', alignment: 'top', direction: 'ltr'})
    $.pigmentSpillArea.layout(Pigment, {columns: 5, rows: 2, gap: {x:0, y: 0}, scaling: 'fill', alignment: 'top', direction: 'ltr'})
    $.meltSpillArea.layout(Melt, {
      columns: 3, 
      rows: 2, 
      gap: {x:1.5, y: 0}, 
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
            <circle cx="50" cy="50" r="50" fill='currentColor'/>
          </svg>
        </div>
      ),
    });

    // game.all(WorkerSpace).appearance({
    //   render: () => (
    //     <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    //       <circle cx="50" cy="50" r="50" />
    //     </svg>
    //   ),
    // });

    game.all(WorkerSpace).appearance({ render: x => ( 
      <div className='WorkerSpace' />
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
          <rect x="0" y="0" width="100" height="55" />
        </svg>
      ),
    });

    game.all(RoundEndSpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="100" height="40" />
        </svg>
      ),
    });

    game.all(BackAlleySpace).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>
      ),
    });

    game.all(MasteryTrack).appearance({
      render: () => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* <rect x="0" y="0" width="100" height="40" /> */}
        </svg>
      ),
    });

    game.all(MasteryCube).appearance({
      render: x => (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color == undefined ? "white" : x.color}>
          <rect x="0" y="0" width="100" height="100" fill="currentColor" opacity={x.color == undefined ? '0' : '100'}/>
        </svg>
      ),
    });

    $.drawCustomer.layout(CustomerCard, {
      offsetColumn: {x: 0, y: 0},
      alignment: 'left'
    });

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


    game.all(PlayerSpace).appearance({ render: x => ( 
      <div className='PlayerSpace'>
        <svg />
      </div>
    ) });
    game.all(PlayerBoard).appearance({ 
      render: x => ( 
      <div className='PlayerBoard'>
        <div className='front' />
        </div>
    ) });

    $.playerSpace.layout('greenBoard', { area: { left: 50, top: 10, width: 30, height: 80 }});
    $.playerSpace.layout(CustomerCard, { 
      area: { left: 5, top: 2, width: 40, height: 96 },
      rows: 3,
      columns: 3,
      gap: {x: 0.5, y: 0.5},
    });

    $.greenMastery.layout(MasteryCube, { 
      area: { left: 3, top: 20, width: 90, height: 7 },
      rows: 1,
      columns: 16,
      gap: {x: 0.25, y: 0},
      direction: 'ltr',
    });

    $.greenBoard.layout('greenDie1', { area: { left: 21, top: 71, width: 10, height: 15 }});
    $.greenBoard.layout('greenDie2', { area: { left: 33.5, top: 71, width: 10, height: 15 }});
    $.greenBoard.layout('greenDie3', { area: { left: 46, top: 71, width: 10, height: 15 }});

    $.greenBoard.layout('greenComponent1', { area: { left: 15, top: 40, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent2', { area: { left: 27, top: 40, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent3', { area: { left: 40, top: 40, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent4', { area: { left: 52, top: 40, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent5', { area: { left: 15, top: 57, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent6', { area: { left: 27, top: 57, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent7', { area: { left: 40, top: 57, width: 10, height: 10 }});
    $.greenBoard.layout('greenComponent8', { area: { left: 52, top: 57, width: 10, height: 10 }});

    $.greenBoard.layout('greenPower1', { area: { left: 2.5, top: 38, width: 10, height: 15 }});
    $.greenBoard.layout('greenPower2', { area: { left: 2.5, top: 55, width: 10, height: 15 }});
    $.greenBoard.layout('greenPower3', { area: { left: 2.5, top: 72, width: 10, height: 15 }});

  }
});
