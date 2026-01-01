import React from 'react';
import { render, Space } from '@boardzilla/core';
import { BuildingCard, BuildingDeck, DisasterSpace, EarthCard, EarthPlayerSpace, EarthRole, EventCard, EventCover, EventRow, GoalCard, Hand, HumanToken, LandCard, LandSpace, LandType, LostHumanSpace, MyGame, OfferingRow, OverlayRow, PlayersSpace, RejectionCard, RejectionRow, RejectionSpace, default as setup, TrustCard, TrustToken, VenusCard } from '../game/index.js';

import './style.scss';

render(setup, {
  settings: {
  },
  announcements: {
    lost: game => {
      return (
        <>
          <h1>
            You Lose!
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
          const index = game.players.indexOf(game.players.allCurrent()[0]);
          return 'player' + Math.max(1, index);
        } else {
          return '';
        }
      }
    }
    );


    game.layout('box', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.layout('trustPile', { area: { left: 0, top: 0, width: 0, height: 0 }});

    game.layout('venusHand', { area: { left: 0, top: 0, width: 100, height: 20 }});
    $.venusHand.layout(VenusCard, {columns: 4, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill', area: { left: 0, top: 15, width: 40, height: 70 }});

    game.layout('trustSpace', { area: { left: 50, top: 3, width: 20, height: 14 }});
    $.trustSpace.layout(TrustCard, {columns: 2, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})
    
    game.layout('rejectionSpace', { area: { left: 75, top: 3, width: 10, height: 14 }});
    $.rejectionSpace.layout(RejectionCard, {columns: 1, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('eventRow', { area: { left: 0, top: 30, width: 100, height: 14 }});
    $.eventRow.layout(EventCard, {columns: 10, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('offeringRow', { area: { left: 0, top: 17.5, width: 100, height: 11.5 }});
    $.offeringRow.layout(VenusCard, {columns: 10, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('rejectionRow', { area: { left: 45, top: 44.5, width: 10, height: 11.5 }});
    $.rejectionRow.layout(RejectionCard, {columns: 1, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('disasterSpace', { area: { left: 45, top: 44.5, width: 10, height: 11.5 }});
    $.disasterSpace.layout(EventCard, {columns: 1, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill'})

    game.layout('venusGoal', { area: { left: 10, top: 44.5, width: 20, height: 11.5 }});
    game.layout('earthGoal', { area: { left: 70, top: 44.5, width: 20, height: 11.5 }});

    game.layout('overlayRow', { area: { left: 0, top: 30, width: 100, height: 14 }});
    $.overlayRow.layout(EventCover, {columns: 10, rows: 1, gap: {x:0.5, y: 0}, scaling: 'fill', direction: 'rtl'})

    $.motivationDeck.layout(EarthCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})
    $.venusHand.layout('motivationDeck', { area: { left: 90, top: 15, width: 10, height: 70 }});

    game.layout('venusDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
    $.venusDeck.layout(VenusCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})    
   
    game.layout('eventDeck', { area: { left: 0, top: 0, width: 0, height: 0 }});
    $.eventDeck.layout(EventCard, {columns: 1, rows: 1, gap: {x: 0, y: 0}, scaling: 'fill'})

    $.venusHand.layout(TrustToken, {columns: 1, rows: 1, area: { left: 41, top: 20, width: 8, height: 40 }});

    for(let i = 1; i < game.players.length; i++) {
      game.players[i].space.layout(LandSpace, {columns: 4, rows: 1, gap: {x:0.5, y: 0.5}, scaling: 'fill', area: { left: 0, top: 0, width: 80, height: 100 }});
      game.all(LandSpace).layout(LandCard, { area: { left: 5, top: 30, width: 90, height: 35 }});
      game.all(LandSpace).layout(BuildingCard, { columns: 1, rows: 1, area: { left: 35, top: 5, width: 30, height: 20 }});
      game.all(LandSpace).layout(HumanToken, { columns: 3, rows: 3, gap: {x:0.5, y: 0.5}, area: { left: 25, top: 40, width: 50, height: 25 }});

      game.all(Hand).layout(RejectionCard, { columns: 2, rows: 6, gap: {x:0.5, y: -5}, area: { left: 82, top: 22, width: 16, height:60 }});
      game.all(LandSpace).layout(EarthCard, { columns: 2, rows: 1, gap: {x:0.5, y: 0.5}, area: { left: 5, top: 68, width: 90, height: 30 }});      

      game.players[i].space.layout(LostHumanSpace, {area: { left: 80, top: 83, width: 18, height: 15 }});
      game.players[i].space.all(LostHumanSpace).layout(HumanToken, { columns: 6, rows: 2, gap: {x:0.5, y: 0.5}});

      game.players[i].space.layout(BuildingDeck, {area: { left: 80, top: 0, width: 20, height: 20 }});
      game.all(BuildingDeck).layout(BuildingCard, {columns: 4, rows: 1});
    }

    $.trustSpace.appearance({render: x => null});
    $.rejectionSpace.appearance({render: x => null});
    $.motivationDeck.appearance({render: x => null});

    game.all(RejectionRow).appearance({render: x => null});
    game.all(DisasterSpace).appearance({render: x => null});
    game.all(OfferingRow).appearance({render: x => null});
    game.all(BuildingDeck).appearance({render: x => null});
    game.all(LostHumanSpace).appearance({render: x => null});
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
            <rect x="0%" y="0%" width="100%" height="100%" fill={x.isInjured ? 'red' : 'white'} stroke="currentColor" strokeWidth="4" />
            <foreignObject x="0%" y="-15%" width="100%" height="100%" fontSize="600%" color="black">
              <center>
                  {game.getRoleIcon(x.earthRole)}
              </center>
            </foreignObject>
          </svg>
          <span className="tooltiptext">{x.earthRole}</span>
        </div>
    )});

    game.all(TrustToken).appearance({render: x => ( 
        <div className='HumanToken'>
          <svg xmlns="http://www.w3.org/2000/svg" color={game.getColor(x)}>
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="green" strokeWidth="8" />
            <foreignObject x="0%" y="5%" width="100%" height="25%" fontSize="125%" color="green">
              <center>
                  Trust
              </center>
            </foreignObject>
            <foreignObject x="0%" y="30%" width="100%" height="70%" fontSize="250%" color="green">
              <center>
                  {$.venusHand.all(TrustToken).length}
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

      game.all(RejectionCard).appearance({render: x => ( 
        <div className='RejectionCard'>
          <svg xmlns="http://www.w3.org/2000/svg" color={game.getColor(x)}>      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="4" />
            <rect x="0%" y="0%" width="100%" height="30%" fill={game.getColor(x) == 'white' ? x.color : 'currentColor'} stroke="black" strokeWidth="4" />
            <foreignObject x="5%" y="5%" width="90%" height="30%" fontSize="50%" color="white">
              <center>
                  {x.getTitle()}
              </center>
            </foreignObject>

            <foreignObject x="0%" y="80%" width="100%" height="20%" fontSize="80%" color="red">
              <center>
                  {x.getTitle() == "" ? "" : "Rejection"}
              </center>
            </foreignObject>

            <foreignObject x="0%" y="40%" width="100%" height="40%" fontSize="175%" color="black">
              <center>
                  {x.container(RejectionSpace) == undefined ? "" : x.container(RejectionSpace)!.all(RejectionCard).length}
              </center>
            </foreignObject>
          </svg>
          <span className="tooltiptext">{x.getTitle()}</span>
        </div>
      )});

      game.all(BuildingCard).appearance({render: x => ( 
        <div className='BuildingCard'>
          <svg xmlns="http://www.w3.org/2000/svg" color={game.getColor(x)}>      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="2" />
            <rect x="0%" y="0%" width="100%" height="20%" fill='currentColor' stroke="black" strokeWidth="2" />
            <foreignObject x="0%" y="0%" width="100%" height="20%" fontSize="75%" color="white">
              <center>
                  {x.buildingType}
              </center>
            </foreignObject>
            <foreignObject x="0%" y="20%" width="100%" height="40%" fontSize="200%" color="white">
              <center>
                  {game.getBuildingIcon(x.buildingType)}
              </center>
            </foreignObject>
            <foreignObject x="5%" y="65%" width="90%" height="30%" fontSize="75%" color="black">
              <center>
                  {x.getText()}
              </center>
            </foreignObject>
          </svg>
          <span className="tooltiptext">{x.getText()}</span>
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
                  {x.visible == "" ? "" : "Trust"}
              </center>
            </foreignObject>
          </svg>
        </div>
      )});

      game.all(GoalCard).appearance({render: x => ( 
        <div className='GoalCard'>
          <svg xmlns="http://www.w3.org/2000/svg">      
            <rect x="0%" y="0%" width="100%" height="100%" fill='white' stroke="black" strokeWidth="3" />
            
            <line x1="32.5%" y1="0%" x2="32.5%" y2="100%" stroke="black" />
            <line x1="55%" y1="0%" x2="55%" y2="100%" stroke="black" />
            <line x1="77.5%" y1="0%" x2="77.5%" y2="100%" stroke="black" />

            <rect x="0%" y="0%" width="10%" height="100%" fill={x.getPlayerCountColor()} stroke="black" strokeWidth="3" />
            <rect x="10%" y="0%" width="90%" height="20%" fill={x.earthPlayerCount > 0 ? (x.forEarthPlayer ? "green" : "purple") : "white"} stroke="black" strokeWidth="3" />
            
            <foreignObject x="12%" y="30%" width="20%" height="88%" fontSize="150%" color="black">
              <center>
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? game.getLocationIcon(LandType.Mountains) : game.getRoleIcon(EarthRole.Medic)) : ""}
                  <br />
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? x.earthMountains : x.venusMedics) : ""}
              </center>
            </foreignObject>

            <foreignObject x="34%" y="30%" width="20%" height="88%" fontSize="150%" color="black">
              <center>
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? game.getLocationIcon(LandType.Farm) : game.getRoleIcon(EarthRole.Engineer)) : ""}
                  <br />
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? x.earthFarm : x.venusEngineers) : ""}
              </center>
            </foreignObject>

            <foreignObject x="56%" y="30%" width="20%" height="88%" fontSize="150%" color="black">
              <center>
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? game.getLocationIcon(LandType.Beach) : game.getRoleIcon(EarthRole.Diplomat)) : ""}
                  <br />
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? x.earthBeach : x.venusDiplomats) : ""}
              </center>
            </foreignObject>

            <foreignObject x="78%" y="30%" width="20%" height="88%" fontSize="150%" color="black">
              <center>
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? game.getLocationIcon(LandType.Forest) : game.getRoleIcon(EarthRole.Soldier)) : ""}
                  <br />
                  {x.earthPlayerCount > 0 ? (x.forEarthPlayer ? x.earthForest : x.venusSoldiers) : ""}
              </center>
            </foreignObject>

            {/*<foreignObject x="0%" y="15%" width="100%" height="60%" fontSize="300%" color="black">
              <center>
                  {game.getRoleIcon(x.earthRole)}
              </center>
            </foreignObject>
            <foreignObject x="0%" y="80%" width="100%" height="20%" fontSize="80%" color="green">
              <center>
                  {x.visible == "" ? "" : "Trust"}
              </center>
            </foreignObject> */}
          </svg>
        </div>
      )});


  }
});
