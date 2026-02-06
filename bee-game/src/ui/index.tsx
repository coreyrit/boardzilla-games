import React from 'react';
import { Piece, render, Space } from '@boardzilla/core';
import { ApiaryCard, ApiaryConvert, ArrangementCard, BeeSpace, BeeToken, Disc, DiscSpace, FieldSpace, FirstPlayerToken, FlowerCard, FlowerColumn, HoneyCard, LarvaHex, MyGame, PlayerScore, PlayerSpace, PlayersSpace, default as setup } from '../game/index.js';
import { D6, useD6 } from '@boardzilla/core/components';

import './style.scss';

render(setup, {
  settings: {
  },
  layout: game => {
    game.appearance({
        render: () => null
      });
      // game.layout('mainBoard', { area: { left: 0, top: 0, width: 100, height: 100 }});

      game.layoutAsDrawer($.playersSpace as Space<MyGame>, 
      { area: { left: 0, top: 10, width: 100, height: 90 }, openDirection: 'up', tab: 'Players',
        openIf: actions => actions.some(a => 
          [
            'chooseBeeToken', 'plantFlower', 'chooseDiscForApiary', 'chooseDiscForFlower', 'chooseWildflowerType'
          ]
        .includes(a.name)),
        closeIf: actions => actions.some(a => 
          [
            'chooseBeeSpace', 'purchaseFlowerByType'
          ]
          .includes(a.name),
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
      { area: { left: 0, top: 10 , width: 100, height: 100 }, tabDirection: 'up', tabs: tabDefs,
      setTabTo: actions => {
        if(game.players.allCurrent().length > 0) {
          return 'player' + game.players.indexOf(game.players.allCurrent()[0]);
        } else {
          return '';
        }
      }
    }
    );

    game.layoutAsDrawer($.arrangements as Space<MyGame>, 
      { area: { left: 18, top: 0, width: 64, height: 30 }, openDirection: 'down', tab: 'Arrangements'        
      });
    $.arrangements.layout(ArrangementCard, {columns: 3, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('bee-space-top-1', { area: {left: 25, top: 0, width: 10, height: 10} });
    game.layout('bee-space-top-2', { area: {left: 45, top: 0, width: 10, height: 10} });
    game.layout('bee-space-top-3', { area: {left: 65, top: 0, width: 10, height: 10} });

    game.layout('bee-space-bottom-1', { area: {left: 25, top: 90, width: 10, height: 10} });
    game.layout('bee-space-bottom-2', { area: {left: 45, top: 90, width: 10, height: 10} });
    game.layout('bee-space-bottom-3', { area: {left: 65, top: 90, width: 10, height: 10} });

    game.layout('bee-space-left-1', { area: {left: 10, top: 18, width: 10, height: 10} });
    game.layout('bee-space-left-2', { area: {left: 10, top: 45, width: 10, height: 10} });
    game.layout('bee-space-left-3', { area: {left: 10, top: 72, width: 10, height: 10} });

    game.layout('bee-space-right-1', { area: {left: 80, top: 18, width: 10, height: 10} });
    game.layout('bee-space-right-2', { area: {left: 80, top: 45, width: 10, height: 10} });
    game.layout('bee-space-right-3', { area: {left: 80, top: 72, width: 10, height: 10} });

    game.all(PlayerSpace).layout(FlowerColumn, {
      rows: 1, columns: 3,
      gap: {x: 1, y: 0},
      area: {left: 15, top: 12, width: 50, height: 65}
    });

    game.all(PlayerSpace).layout(LarvaHex, {
      rows: 1, columns: 2,
      gap: {x: 1, y: 0},
      area: {left: 70, top: 0, width: 20, height: 10}
    });

    game.all(FlowerColumn).layout(FlowerCard, {
      rows: 4, columns: 1,
      gap: {x: 0, y: -10},
    });

    game.all(PlayerSpace).layout(FirstPlayerToken, {
      area: {left: 2, top: 0, width: 10, height: 10}
    });

    game.all(PlayerSpace).layout(PlayerScore, {
      area: {left: 90, top: 0, width: 10, height: 10}
    });

    game.all(PlayerSpace).layout(BeeToken, {
      rows: 8, columns: 1,
      gap: {x: 0, y: 0.5},
      area: {left: 2, top: 12, width: 10, height: 88}
    });

    game.all(PlayerSpace).layout(DiscSpace, {
      area: {left: 15, top: 0, width: 50, height: 10}
    });

    game.all(DiscSpace).layout(Disc, {
      rows: 1, columns: 10,
      gap: {x: 0.5, y: 0},
      area: {left: 0, top: 0, width: 100, height: 100}
    });

    game.all(PlayerSpace).layout(ApiaryCard, {
      rows: 3, columns: 1,
      gap: {x: 0, y: 0.5},
      area: {left: 70, top: 10, width: 22, height: 54}
    });

    game.all(PlayerSpace).layout(HoneyCard, {
      rows: 1, columns: 9,
      gap: {x: -20, y: 0},
      area: {left: 70, top: 65, width: 55, height: 18}
    });

    game.all(FlowerCard).layout(Disc, {
      rows: 1, columns: 1,
      gap: {x: 0, y: 0},
      area: {left: 3, top: 0, width: 30, height: 30}
    });

    game.all(ApiaryCard).layout(Disc, {
      rows: 1, columns: 4,
      gap: {x: 0.5, y: 0},
      area: {left: 5, top: 23, width: 90, height: 50}
    });

    game.layout('flowerDeck', { area: {left: -12, top: 2, width: 20, height: 28} });
    $.flowerDeck.layout(FlowerCard, {
      rows: {max: 1},
      offsetColumn: {x: 0.25, y: 0.25},
      direction: 'ltr',      
    });

    game.layout('honeyDeck', { area: {left: -12, top: 32, width: 20, height: 28} });
    $.honeyDeck.layout(HoneyCard, {
      rows: {max: 1},
      offsetColumn: {x: 0.25, y: 0.25},
      direction: 'ltr',      
    });

    game.layout('arrangementDeck', { area: {left: -12, top: 62, width: 20, height: 28} });
    $.arrangementDeck.layout(ArrangementCard, {
      rows: {max: 1},
      offsetColumn: {x: 0.25, y: 0.25},
      direction: 'ltr',      
    });


    game.layout('field', { area: { left: 20, top: 10, width: 60, height: 80 }});
    $.field.layout(FieldSpace, {
      rows: 3, columns: 3,
      gap: {x: 2, y: 2},
    });

    game.layout('honey', { area: { left: 92, top: 4, width: 25, height: 92 }});
    $.honey.layout(HoneyCard, {
      rows: 5, columns: 1,
      gap: {x: 0, y: 0.5},
    });

    game.layout('pool', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.all(FlowerCard).appearance({ render: x => ( 
      <div className='FlowerCard'>
        <div className={x.faceUp ? 'face' : 'back'} />
      </div>
    ) });

    game.all(HoneyCard).appearance({ render: x => ( 
      <div className='HoneyCard'>
        <div className={x.rot ? 'rot' : (x.faceUp ? 'face' : 'back')} />
      </div>
    ) });

    game.all(ArrangementCard).appearance({ render: x => ( 
      <div className='ArrangementCard'>
        <div className={x.faceUp ? 'face' : 'back'} />
      </div>
    ) });

    game.all(BeeToken).appearance({ render: x => ( 
      <div className='BeeToken'>
        <div className={x.upgraded ? 'upgraded' : 'base'} />
      </div>
    ) });

    game.all(Disc).appearance({ render: x => ( 
      <div className='Disc'>
        <div className={x.color} />
      </div>
    ) });

    game.all(FirstPlayerToken).appearance({ render: x => ( 
      <div className='FirstPlayerToken'>
      </div>
    ) });

    game.all(LarvaHex).appearance({ render: x => ( 
      <div className='LarvaHex'>
      </div>
    ) });

    game.all(ApiaryCard).appearance({ render: x => ( 
      <div className='ApiaryCard'>
        <div className={x.color} />
      </div>
    ) });

    game.all(ApiaryConvert).appearance({ render: x => ( 
      <div className='ApiaryConvert'>
      </div>
    ) });

    game.all(PlayerScore).appearance({ render: x => ( 
      <div className='PlayerScore'>
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="50" fontSize="300%" fill="black">{x.score}</text>
        </svg> 
      </div>
    ) });

    game.all(BeeSpace).appearance({ render: x => ( 
      <div className='BeeSpace'>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="blue" strokeWidth="4" fill="black" fillOpacity=".2" strokeOpacity="0" />
          </svg>
      </div>
    ) });

    game.all(BeeSpace).layout(BeeToken, {
      rows: 1, columns: 1,
      gap: {x: 0, y: 0},
      area: {left: 8, top: 8, width: 84, height: 84}
    });

    game.all(ApiaryCard).layout(ApiaryConvert, {
      area: {left: 20, top: 70, width: 60, height: 20}
    });

    $.flowerDeck.appearance({ render: x => null });
    $.honeyDeck.appearance({ render: x => null });
    $.arrangementDeck.appearance({ render: x => null });

    $.field.appearance({ render: x => null })
    $.pool.appearance({ render: x => null })
    $.honey.appearance({ render: x => null })

    game.all(FlowerColumn).appearance({ render: x => null });
    game.all(FieldSpace).appearance({ render: x => null });
    game.all(PlayerSpace).appearance({ render: x => null });
    game.all(PlayersSpace).appearance({ render: x => null });
    game.all(DiscSpace).appearance({ render: x => null });    
    // game.all(ApiaryConvert).appearance({ render: x => null });    

    game.layout('flowerDie', { area: { left: 82, top: 2, width: 6, height: 6 }});
    useD6(game);
  }
});
