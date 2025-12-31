import React from 'react';
import { render, Space } from '@boardzilla/core';
import { BuildingCard, BuildingDeck, EarthCard, EarthPlayerSpace, EventCard, EventCover, EventRow, Hand, HumanToken, LandCard, LandSpace, MyGame, OverlayRow, PlayersSpace, RejectionCard, default as setup, TrustCard, VenusCard } from '../game/index.js';

import './style.scss';

render(setup, {
  settings: {
  },
  layout: game => {
    game.appearance({
      render: () => null
    });

    // game.layoutAsDrawer($.playersSpace as Space<MyGame>, 
    //   { area: { left: 0, top: 60, width: 100, height: 40 }, openDirection: 'up', tab: 'Players',
    //     openIf: actions => actions.some(a => 
    //       [
    //         'flipLED', 'placeToken', 'recallToken', 'revisedReportingStandards', "moraleComitteeInitiative"
    //       ]
    //     .includes(a.name)),
    //     closeIf: actions => actions.some(a => 
    //       [
    //         'chooseFunding', 'chooseFundingFromDraw', 'useOverclockedReactor'
    //       ]
    //       .includes(a.name),
    //       ),
    //   });

      var index = 0;
      let tabSpaces: Record<string, Space<MyGame> | string> = {};
      let tabDefs: Record<string, React.ReactNode> = {};
      // game.players.forEach(x => {
      for(let i = 1; i < game.players.length; i++) {
        const x = game.players[i];
        tabSpaces['player' + i] = x.space;
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
        tabDefs['player' + i]  = tab;
        index++;
      };

    $.playersSpace.layoutAsTabs(tabSpaces,
      { area: { left: 0, top: 60 , width: 100, height: 40 }, tabDirection: 'up', tabs: tabDefs,
      setTabTo: actions => {
        if(game.players.allCurrent().length > 0) {
          return 'player' + game.players.indexOf(game.players.allCurrent()[0]);
        } else {
          return '';
        }
      }
    }
    );


    game.layout('box', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.layout('trustPile', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.layout('venusHand', { area: { left: 0, top: 0, width: 100, height: 20 }});
    $.venusHand.layout(VenusCard, {columns: 3, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill', area: { left: 10, top: 15, width: 30, height: 70 }});

    game.layout('trustSpace', { area: { left: 50, top: 3, width: 20, height: 14 }});
    $.trustSpace.layout(TrustCard, {columns: 2, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})
    
    game.layout('rejectionSpace', { area: { left: 75, top: 3, width: 10, height: 14 }});

    game.layout('eventRow', { area: { left: 0, top: 30, width: 100, height: 14 }});
    $.eventRow.layout(EventCard, {columns: 10, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('overlayRow', { area: { left: 0, top: 30, width: 100, height: 14 }});
    $.overlayRow.layout(EventCover, {columns: 10, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill', direction: 'rtl'})

    $.motivationDeck.layout(EarthCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})
    $.venusHand.layout('motivationDeck', { area: { left: 90, top: 15, width: 10, height: 70 }});

    game.layout('venusDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
    $.venusDeck.layout(VenusCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})    
   
    game.layout('eventDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
    $.eventDeck.layout(EventCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})

    for(let i = 1; i < game.players.length; i++) {
      game.players[i].space.layout(LandSpace, {columns: 4, rows: 1, gap: {x:0.5, y: 0.5}, scaling: 'fill', area: { left: 0, top: 0, width: 80, height: 100 }});
      game.all(LandSpace).layout(LandCard, { area: { left: 25, top: 30, width: 50, height: 35 }});
      game.all(LandSpace).layout(HumanToken, { columns: 3, rows: 3, gap: {x:0.5, y: 0.5}, area: { left: 25, top: 40, width: 50, height: 25 }});

      game.all(Hand).layout(RejectionCard, { columns: 3, rows: 3, gap: {x:0.5, y: 0.5}, area: { left: 80, top: 20, width: 20, height: 80 }});
      game.all(LandSpace).layout(EarthCard, { columns: 2, rows: 1, gap: {x:0.5, y: 0.5}, area: { left: 5, top: 68, width: 90, height: 30 }});      

      game.players[i].space.layout(BuildingDeck, {area: { left: 80, top: 0, width: 20, height: 20 }});
      game.all(BuildingDeck).layout(BuildingCard, {columns: 4, rows: 1});
    }

    $.trustSpace.appearance({render: x => null});
    $.rejectionSpace.appearance({render: x => null});
    $.motivationDeck.appearance({render: x => null});

    game.all(EventRow).appearance({render: x => null});
    game.all(OverlayRow).appearance({render: x => null});
    game.all(LandSpace).appearance({render: x => null});
    game.all(Hand).appearance({render: x => null});
    game.all(EarthPlayerSpace).appearance({render: x => null});
    game.all(PlayersSpace).appearance({render: x => null});

    game.all(EventCover).appearance({render: x => ( 
        <div className='EventCover'>
          <svg xmlns="http://www.w3.org/2000/svg">      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="4" />
          </svg>
        </div>
      )});

    game.all(HumanToken).appearance({render: x => ( 
        <div className='HumanToken'>
          <svg xmlns="http://www.w3.org/2000/svg" color={game.getColor(x)}>
            <rect x="0%" y="0%" width="100%" height="100%" fill={x.isInjured ? 'red' : 'white'} stroke="currentColor" strokeWidth="8" />
            <foreignObject x="0%" y="-15%" width="100%" height="100%" fontSize="600%" color="black">
              <center>
                  {game.getRoleIcon(x.earthRole)}
              </center>
            </foreignObject>
          </svg>
        </div>
    )});

    game.all(LandCard).appearance({render: x => ( 
        <div className='LandCard'>
          <svg xmlns="http://www.w3.org/2000/svg" color={game.getColor(x)}>
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="2" />
            <rect x="0%" y="0%" width="100%" height="25%" fill='currentColor' stroke="black" strokeWidth="2" />
            <foreignObject x="0%" y="-3%" width="100%" height="25%" fontSize="125%" color="white">
              <center>
                  {game.getLocationIcon(x.landType)}
              </center>
            </foreignObject>
          </svg>
        </div>
    )});

    game.all(EventCard).appearance({render: x => ( 
        <div className='EventCard'>
          <svg xmlns="http://www.w3.org/2000/svg">      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="4" />
            <foreignObject x="5%" y="5%" width="90%" height="20%" fontSize="50%">
              <center>
                  <b>{x.getDisasterName()}</b>
              </center>
            </foreignObject>
            <foreignObject x="5%" y="25%" width="90%" height="25%" fontSize="40%">
              <center>
                  {x.getLocationName() != "" ? "Damage all" : ""} <b>{x.getLocationName()}</b> {x.getLocationName() != "" ? "areas" : ""}
              </center>
            </foreignObject>
            <foreignObject x="5%" y="50%" width="90%" height="50%" fontSize="200%">
              <center>
                  {game.getLocationIcon(x.disasterLocation)}
              </center>
            </foreignObject>
          </svg>
        </div>
      )});

    game.all(VenusCard).appearance({render: x => ( 
        <div className='VenusCard'>
          <svg xmlns="http://www.w3.org/2000/svg">      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="4" />
            <rect x="0%" y="0%" width="100%" height="30%" fill='purple' stroke="black" strokeWidth="4" />
            <foreignObject x="5%" y="5%" width="90%" height="20%" fontSize="50%" color="white">
              <center>
                  {x.getTitle()}
              </center>
            </foreignObject>

            <foreignObject x="0%" y="33%" width="100%" height="45%" fontSize="125%" color="black">
              <center>
                  {x.getImage()}
              </center>
            </foreignObject>

            <rect x="0%" y="63%" width="100%" height="35%" fill='white' stroke="black" strokeWidth="1" fillOpacity="0" />
            <foreignObject x="5%" y="65%" width="90%" height="30%" fontSize="50%" color="red">
              <center>
                  {x.getSideEffectText()}
              </center>
            </foreignObject>
          </svg>
        </div>
      )});


      game.all(TrustCard).appearance({render: x => ( 
        <div className='TrustCard'>
          <svg xmlns="http://www.w3.org/2000/svg">      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="4" />
            <foreignObject x="0%" y="10%" width="100%" height="20%" fontSize="80%" color="black">
              <center>
                  {x.earthRole}
              </center>
            </foreignObject>
            <foreignObject x="0%" y="15%" width="100%" height="60%" fontSize="300%" color="black">
              <center>
                  {game.getRoleIcon(x.earthRole)}
              </center>
            </foreignObject>
            <foreignObject x="0%" y="80%" width="100%" height="20%" fontSize="80%" color="green">
              <center>
                  {x.earthRole == "" ? "" : "Trust"}
              </center>
            </foreignObject>

            {/*<foreignObject x="0%" y="33%" width="100%" height="45%" fontSize="125%" color="black">
              <center>
                  {x.getImage()}
              </center>
            </foreignObject>

            <rect x="0%" y="63%" width="100%" height="35%" fill='white' stroke="black" strokeWidth="1" fillOpacity="0" />
            <foreignObject x="5%" y="65%" width="90%" height="30%" fontSize="50%" color="red">
              <center>
                  {x.getSideEffectText()}
              </center>
            </foreignObject> */}
          </svg>
        </div>
      )});


  }
});
