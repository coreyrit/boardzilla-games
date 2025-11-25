import React from 'react';
import { render } from '@boardzilla/core';
import { CubePlate, FundingCard, FundingSpace, MainBoard, ResourceCube, default as setup, UpgradeCard, UpgradeSpace } from '../game/index.js';

import './style.scss';

render(setup, {
  settings: {
  },
  layout: game => {
      game.appearance({
        render: () => null
      });
      game.layout('mainBoard', { area: { left: 0, top: 0, width: 100, height: 100 }});
      game.layout('bag', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('supply', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('fundingDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('upgradeDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});

      $.mainBoard.layout('cubePlate1', { area: { left: 5.5, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate2', { area: { left: 22.5, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate3', { area: { left: 39, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate4', { area: { left: 55.5, top: 74.5, width: 10, height: 10 }});

      $.cubePlate1.layout(ResourceCube, {columns: 2, rows: 2, gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate2.layout(ResourceCube, {columns: 2, rows: 2, gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate3.layout(ResourceCube, {columns: 2, rows: 2, gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate4.layout(ResourceCube, {columns: 2, rows: 2, gap: {x:2, y: 2}, scaling: 'fill'})

      $.mainBoard.layout('funding1', { area: { left: 3, top: 43, width: 16, height: 22.4 }});
      $.mainBoard.layout('funding2', { area: { left: 19.5, top: 43, width: 16, height: 22.4 }});
      $.mainBoard.layout('funding3', { area: { left: 36, top: 43, width: 16, height: 22.4 }});
      $.mainBoard.layout('funding4', { area: { left: 52.5, top: 43, width: 16, height: 22.4 }});

      $.mainBoard.layout('upgrade1-a', { area: { left: 71, top: 21.5, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade1-b', { area: { left: 84, top: 21.5, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade2-a', { area: { left: 71, top: 38.25, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade2-b', { area: { left: 84, top: 38.25, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade3-a', { area: { left: 71, top: 55, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade3-b', { area: { left: 84, top: 55, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade4-a', { area: { left: 71, top: 71.75, width: 12, height: 16.8 }});
      $.mainBoard.layout('upgrade4-b', { area: { left: 84, top: 71.75, width: 12, height: 16.8 }});

      game.all(MainBoard).appearance({render: x => ( 
        <div className='MainBoard'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">      
          </svg>
        </div>
      )});
      game.all(CubePlate).appearance({render: x => ( 
        <div className='CubePlate'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
        </div>
      )});
      game.all(FundingSpace).appearance({render: x => ( 
        <div className='FundingSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
        </div>
      )});
      game.all(UpgradeSpace).appearance({render: x => ( 
        <div className='UpgradeSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
        </div>
      )});
      game.all(ResourceCube).appearance({render: x => ( 
        <div className='ResourceCube'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.color}>
            <rect x="0" y="0" width="100" height="100" fill='currentColor' stroke="black" strokeWidth="4" />
          </svg>
        </div>
      )});

      game.all(FundingCard).appearance({render: x => ( 
        <div className='FundingCard'>
          <svg viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <rect x="0" y="0" width="100%" height="100%" fill='white' stroke="black" strokeWidth="3" />
            <foreignObject x="2%" y="3%" width="96%" height="60%" fontSize="40%">
              <div><center><b>{x.name}</b></center></div>
              <div><center>{x.effect}</center></div>
            </foreignObject>
            <foreignObject x="0%" y="60%" width="100%" height="40%" fontSize="40%">
              <div className={x.type.toString()}>
                <svg viewBox="0 0 100 100" width="30%" xmlns="http://www.w3.org/2000/svg" />
              </div>
              <div className="TrashFunding">
                <svg viewBox="0 0 100 100" width="20%" xmlns="http://www.w3.org/2000/svg" />
              </div>
              </foreignObject>
          </svg>
        </div>
      )});

      game.all(UpgradeCard).appearance({render: x => ( 
        <div className='UpgradeCard'>
          <svg viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <rect x="0" y="0" width="100%" height="100%" fill='white' stroke="black" strokeWidth="3" />
            <circle cx="17%" cy="12%" r="10%" fill='yellow' stroke="black" strokeWidth="1" />
            <text x="17%" y="12%" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="60%">{x.cost}</text>
            <foreignObject x="28%" y="3%" width="70%" height="20%" fontSize="40%">
              <div><center><b>{x.name}</b></center></div>
            </foreignObject>
            <text x="50%" y="35%" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="60%">{x.effect}</text>
            <foreignObject x="2%" y="50%" width="100%" height="40%">
              <div className={x.type.toString()}>
                <svg viewBox="0 0 100 100" width="30%" xmlns="http://www.w3.org/2000/svg" />
              </div>
            </foreignObject>
            <text x="52.5%" y="80%" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="35%">{x.typeName()}</text>
            <text x="52.5%" y="90%" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="55%">{x.stageName()}</text>
          </svg>
        </div>
      )});
  }
});
