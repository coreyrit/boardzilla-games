import React from 'react';
import { render, Space } from '@boardzilla/core';
import { MyGame, default as setup, BlueBreakthroughPlayer } from '../game/index.js';
import { PlayerSpace, PlayerBoard, ResourceCube, CubeBag, Supply, CubeColor, FundingSpace,
  FundingDeck, FundingCard, UpgradeSpace, UpgradeDeck, UpgradeCard, CubePlate, ScoreCube, 
  ScoreSpace, ScoreTrack, MainBoard, PlayersSpace, PowerToken, TokenAbility, AvailableTokenSpace,
  PowerTokenSpace,
  TokenAction,
  ReactorSpace,
  UpgradeType,
  LEDSpace,
  LEDCard,
  LEDRow,
  ResourceSpace,
  UnavailableTokenSpace,
  StorageSpace,
  RoundSpace,
  RoundTracker,
  PublishToken,
  ReferenceSpace,
  PriorityPawn,
 } from '../game/components.js';

import './style.scss';

render(setup, {
  settings: {
  },
  layout: game => {
      game.appearance({
        render: () => null
      });
      game.layout('mainBoard', { area: { left: 0, top: 0, width: 100, height: 100 }});

      game.layoutAsDrawer($.playersSpace as Space<MyGame>, 
      { area: { left: 0, top: 10, width: 100, height: 90 }, openDirection: 'up', tab: 'Players',
        openIf: actions => actions.some(a => 
          [
            'flipLED', 'placeToken', 'recallToken'
          ]
        .includes(a.name)),
        closeIf: actions => actions.some(a => 
          [
            'chooseFunding'
          ]
          .includes(a.name),
          ),
      });

      game.layoutAsDrawer($.reference as Space<MyGame>, 
      { area: { left: 0, top: 0, width: 75, height: 28 }, openDirection: 'down', tab: 'Reference',
      });
      $.reference.layout(LEDCard, {columns: 2, rows: 1, gap: {x:2, y: 0}, scaling: 'fill'})

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

      game.layout('bag', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('supply', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('fundingDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
      game.layout('upgradeDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});

      $.mainBoard.layout('cubePlate1', { area: { left: 5.5, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate2', { area: { left: 22.5, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate3', { area: { left: 39, top: 74.5, width: 10, height: 10 }});
      $.mainBoard.layout('cubePlate4', { area: { left: 55.5, top: 74.5, width: 10, height: 10 }});

      $.cubePlate1.layout(ResourceCube, {gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate2.layout(ResourceCube, {gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate3.layout(ResourceCube, {gap: {x:2, y: 2}, scaling: 'fill'})
      $.cubePlate4.layout(ResourceCube, {gap: {x:2, y: 2}, scaling: 'fill'})

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

      game.all(PlayersSpace).appearance({ render: x => ( 
        <div className='PlayersSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">      
          </svg>
        </div>
      )});
      game.all(PlayerSpace).appearance({ render: x => ( 
        <div className='PlayerSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">      
          </svg>
        </div>
      )});
      game.all(PlayerBoard).appearance({ render: x => ( 
      <div className='PlayerBoard'>
        <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">      
          </svg>
      </div>
      )});
      game.all(ReferenceSpace).appearance({ render: x => ( 
      <div className='ReferenceSpace'>
        <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">      
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
            <foreignObject x="2%" y="3%" width="96%" height="60%" fontSize="35%">
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

      game.all(PowerToken).appearance({render: x => ( 
        <div className='PowerToken'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.getColor()}>
            <circle cx="50" cy="50" r="35" fill='currentColor' stroke="black" strokeWidth="4" />
            <text x="50" y="52" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="40">{x.getSymbol()}</text>
          </svg>
        </div>
      )});
      game.all(AvailableTokenSpace).appearance({render: x => ( 
        <div className='AvailableTokenSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
        </div>
      )});
      game.all(UnavailableTokenSpace).appearance({render: x => ( 
        <div className='UnavailableTokenSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" />
        </div>
      )});
      game.all(ScoreTrack).appearance({render: x => ( 
        <div className='ScoreTrack'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(ScoreSpace).appearance({render: x => ( 
        <div className='ScoreSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(PowerTokenSpace).appearance({render: x => ( 
        <div className='ScoreSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(StorageSpace).appearance({render: x => ( 
        <div className='ScoreSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(ScoreCube).appearance({render: x => ( 
        <div className='PowerToken'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" color={x.getColor()}>
            <rect x="0" y="0" width="100" height="100" fill='currentColor' stroke="black" strokeWidth="4" />
          </svg>
        </div>
      )});
      game.all(ReactorSpace).appearance({render: x => ( 
        <div className='PowerToken'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(LEDSpace).appearance({render: x => ( 
        <div className='PowerToken'>
          <svg viewBox="0 0 100 72" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(ResourceSpace).appearance({render: x => ( 
        <div className='ResourceSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(RoundSpace).appearance({render: x => ( 
        <div className='RoundSpace'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(LEDRow).appearance({render: x => ( 
        <div className='LEDRow'>
          <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
      )});
      game.all(RoundTracker).appearance({render: x => ( 
        <div className='RoundTracker'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="25" r="20" fill='lightblue' stroke="darkblue" strokeWidth="5" />
          </svg>
        </div>
      )});

      game.all(PriorityPawn).appearance({render: x => ( 
        <div className='PriorityPawn'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,50 50,0 100,50 50 100" fill="blue" />
          </svg>
        </div>
      )});

      game.all(PublishToken).appearance({render: x => ( 
        <div className='RoundTracker'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill='white' stroke="black" strokeWidth="4" />
            <text x="50" y="54" text-anchor="middle" dominant-baseline="middle" fill="black" font-size="60" opacity={x.flipped ? "100" : "0"}>✎</text>
          </svg>
        </div>
      )});


      game.all(LEDCard).appearance({render: x => ( 
        <div className='LEDCard'>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="75" fill='white' stroke="black" strokeWidth="2" />
            <text x="2" y="70" fill="black" font-size="8">{x.layers[0].text}</text>
            <text x="2" y="60" fill="black" font-size="8">{x.layers[1].text}</text>
            <text x="2" y="50" fill="black" font-size="8">{x.layers[2].text}</text>
            <text x="2" y="40" fill="black" font-size="8">{x.layers[3].text}</text>
            <text x="2" y="30" fill="black" font-size="8">{x.layers[4].text}</text>
            <text x="2" y="20" fill="black" font-size="8">{x.layers[5].text}</text>
            <text x="2" y="10" fill="black" font-size="8">{x.layers[6].text}</text>
          </svg>
        </div>
      )});
//       game.all(LEDLayer).appearance({render: x => ( 
//         <div className='LEDLayer'>
//           <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//             <text x="5" y="10" width="90" fill="black" font-size="5" opacity={x.container(LEDCard)!.show ? 100 : 0}>{x.text}</text>
// \\
//           </svg>
//         </div>
//       )});

      game.all(ResourceSpace).layout(ResourceCube, 
          {
            area: { left: 0.5, top: 0.5, width: 90, height: 4.5 },
            columns: 20, rows: 1, gap: {x:0.5, y:0},
          }
        );

      game.all(PlayerSpace).layout(PublishToken, 
          {
            area: { left: 85, top: 25, width: 5, height: 40 },
            columns: 1, rows: 5, gap: {x:0, y:3},
          }
        );

      game.all(MainBoard).layout(RoundSpace, 
          {
            area: { left: 3, top: 22, width: 65, height: 4.5 },
            columns: 7, rows: 1, gap: {x:0, y:0},
          }
        );          

      game.all(ScoreTrack).layout(ScoreSpace, {columns: 10, rows: 1, gap: {x:1.5, y: 0}})      
      game.all(LEDSpace).layout(LEDCard, {columns: 1, rows: 1})
      game.all(LEDSpace).layout(LEDRow, 
        {
          area: { left: 80, top: 0, width: 20, height: 100 },
          columns: 1, rows: 7,
          gap: {x:0, y: 0},
          direction: 'btt'
        }
      )
      game.all(LEDRow).layout(ResourceCube, 
        {
          columns: 4, rows: 1
        }
      );


      game.all(AvailableTokenSpace).layout(PowerToken, {columns: 1, rows: 9, gap: {x:0, y: -2}})
      game.all(UnavailableTokenSpace).layout(PowerToken, {columns: 1, rows: 9, gap: {x:0, y: -2}})

      game.players.forEach(x => {
        x.space.layout(PlayerBoard, {area: { left: 0, top: 2, width: 90, height: 100 }});

        x.space.layout(PriorityPawn, {area: { left: 0.5, top: 10, width: 4, height: 4 }});
        
        // x.space.layout(ResourceCube, 
        //   {
        //     area: { left: 0.5, top: 0.5, width: 90, height: 4.5 },
        //     columns: 20, rows: 1, gap: {x:0.5, y:0},
        //   }
        // );
        x.space.layout(FundingCard, 
          {
            area: { left: 90, top: 0, width: 10, height: 100 },
            columns: 1, rows: 8, gap: {x:0, y:-5},
          }
        );        

        x.board.layout(x.board.first(AvailableTokenSpace)!, { 
          area: { left: 6, top: 8, width: 10, height: 70 },
        });

        x.board.layout(x.board.first(UnavailableTokenSpace)!, { 
          area: { left: 85, top: 8, width: 10, height: 70 },
        });

        x.board.layout(x.board.first(ScoreTrack, {tens: true})!, { 
          area: { left: 37.5, top: 11.5, width: 43.5, height: 5 },
        });
        x.board.layout(x.board.first(ScoreTrack, {tens: false})!, { 
          area: { left: 37.5, top: 16, width: 43.5, height: 5 },
        });
        x.board.layout(x.board.first(PowerTokenSpace, {action: TokenAction.Funding})!, { 
          area: { left: 16, top: 11.5, width: 10, height: 10 },
        });
        x.board.layout(x.board.first(PowerTokenSpace, {action: TokenAction.Resources})!, { 
          area: { left: 16, top: 25, width: 10, height: 10 },
        });
        x.board.layout(x.board.first(PowerTokenSpace, {action: TokenAction.Upgrade})!, { 
          area: { left: 16, top: 38.5, width: 10, height: 10 },
        });

        x.board.layout(x.board.first(StorageSpace, {stage: 1})!, { 
          area: { left: 19, top: 55, width: 4, height: 4 },
        });
        x.board.layout(x.board.first(StorageSpace, {stage: 2})!, { 
          area: { left: 19, top: 61.5, width: 4, height: 4 },
        });
        x.board.layout(x.board.first(StorageSpace, {stage: 3})!, { 
          area: { left: 19, top: 68, width: 4, height: 4 },
        });        

        x.board.all(UpgradeCard).appearance({
          aspectRatio: 3 / 4
        })
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.injection})!, { 
          area: { left: 27, top: 20, width: 17, height: 17 },
        });
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.nozzle})!, { 
          area: { left: 47, top: 20, width: 17, height: 17 },
        });
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.cooling})!, { 
          area: { left: 67, top: 20, width: 17, height: 17 },
        });
        x.board.layout(x.board.all(ReactorSpace, {type: UpgradeType.pump})[0], { 
          area: { left: 27, top: 39, width: 17, height: 17 },
        });
        x.board.layout(x.board.all(ReactorSpace, {type: UpgradeType.pump})[1], { 
          area: { left: 67, top: 39, width: 17, height: 17 },
        });
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.exhaust})!, { 
          area: { left: 27, top: 58, width: 17, height: 17 },
        });
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.heater})!, { 
          area: { left: 47, top: 58, width: 17, height: 17 },
        });
        x.board.layout(x.board.first(ReactorSpace, {type: UpgradeType.trap})!, { 
          area: { left: 67, top: 58, width: 17, height: 17 },
        });

        x.board.layout(x.board.first(LEDSpace)!, { 
          area: { left: 44, top: 39, width: 22.5, height: 17 },          
        });
      });
  }
});
