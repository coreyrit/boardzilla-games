import { MyGame } from './index.js';
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
  ResourceSpace
 } from './components.js';
import { fundingCards } from './funding.js';
import { upgradeCards } from './upgrades.js';

export function buildGame(game: MyGame) {
  const mainBoard = game.create(MainBoard, "mainBoard");
  const bag = game.create(CubeBag, "bag");
  const supply = game.create(Supply, "supply");

  // set up players
  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(var i = 1; i <= game.players.length; i++) {
    const playerSpace = playersSpace.create(PlayerSpace, 'playerSpace' + i, {player: game.players[i]});
    const playerBoard = playerSpace.create(PlayerBoard, 'p' + i + "Board")
    playerBoard.player = game.players[i];
    
    const player = game.players[i-1];

    player.space = playerSpace
    player.space.player = player
    player.board = playerBoard

    const availableTokens = playerBoard.create(AvailableTokenSpace, 'availableTokens' + i);
    availableTokens.create(PowerToken, 'token0-' + i, {value: 0, ability: TokenAbility.None});
    availableTokens.create(PowerToken, 'token1-' + i, {value: 1, ability: TokenAbility.None});
    availableTokens.create(PowerToken, 'token2a-' + i, {value: 2, ability: TokenAbility.A});
    availableTokens.create(PowerToken, 'token2b-' + i, {value: 2, ability: TokenAbility.B});
    availableTokens.create(PowerToken, 'token3a-' + i, {value: 3, ability: TokenAbility.A});
    availableTokens.create(PowerToken, 'token3b-' + i, {value: 3, ability: TokenAbility.B});
    availableTokens.create(PowerToken, 'token4-' + i, {value: 4, ability: TokenAbility.None});
    availableTokens.create(PowerToken, 'tokenPublish-' + i, {value: 0, ability: TokenAbility.Publish});
    availableTokens.create(PowerToken, 'tokenRecall-' + i, {value: 0, ability: TokenAbility.Recall});

    availableTokens.all(PowerToken).forEach( x => {
      x.showOnlyTo(player)
    });

    const onesScoreTrack = playerBoard.create(ScoreTrack, 'onesScoreTrack' + i, {tens: false});
    const tensScoreTrack = playerBoard.create(ScoreTrack, 'tensScoreTrack' + i, {tens: true});
    for(var s = 0; s < 10; s++) {
      onesScoreTrack.create(ScoreSpace, 'onesScore' + s + '-p' + i, {value: s});
      tensScoreTrack.create(ScoreSpace, 'tensScore' + s + '-p' + i, {value: s*10});
    }

    const oneCube = playerBoard.first(ScoreTrack, {tens: false})!.first(ScoreSpace, {value: 0})!
      .create(ScoreCube, 'oneScoreCube' + i, {value: 0});
    const tenCube = playerBoard.first(ScoreTrack, {tens: true})!.first(ScoreSpace, {value: 0})!
      .create(ScoreCube, 'tenScoreCube' + i, {value: 0});


    playerBoard.create(PowerTokenSpace, 'powerTokenSpaceFunding' + i, {action: TokenAction.Funding});
    playerBoard.create(PowerTokenSpace, 'powerTokenSpaceResources' + i, {action: TokenAction.Resources});
    playerBoard.create(PowerTokenSpace, 'powerTokenSpaceUpgrade' + i, {action: TokenAction.Upgrade});

    playerBoard.create(ReactorSpace, 'injection' + i, {type: UpgradeType.injection});
    playerBoard.create(ReactorSpace, 'nozzle' + i, {type: UpgradeType.nozzle});
    playerBoard.create(ReactorSpace, 'cooling' + i, {type: UpgradeType.cooling});
    playerBoard.create(ReactorSpace, 'leftPump' + i, {type: UpgradeType.pump});
    playerBoard.create(ReactorSpace, 'rightPump' + i, {type: UpgradeType.pump});
    playerBoard.create(ReactorSpace, 'exhaust' + i, {type: UpgradeType.exhaust});
    playerBoard.create(ReactorSpace, 'heater' + i, {type: UpgradeType.heater});
    playerBoard.create(ReactorSpace, 'trap' + i, {type: UpgradeType.trap});

    playerSpace.create(ResourceSpace, 'resourceSpace' + i);

    const led = playerBoard.create(LEDSpace, 'led' + i);

    const GaN = led.create(LEDCard, 'ledGaN_A' + i, { 
      letter: 'A',
      layers: [
        {index: 1, text: '⬜ → 1 ⭐ ea.', colors: [CubeColor.White], optional: false, repeatable: true},
        {index: 2, text: '(⬜ 🟦) → 5 ⭐', colors: [CubeColor.White, CubeColor.Blue], optional: true, repeatable: false},
        {index: 3, text: '🟦 → 1 ⭐ ea. ', colors: [CubeColor.Blue], optional: false, repeatable: true},
        {index: 4, text: '🟦 🟥 → 5 ⭐', colors: [CubeColor.Blue, CubeColor.Red], optional: false, repeatable: false},
        {index: 5, text: '(🟨),(🟨),(🟨) → 5,12,20 ⭐', colors: [CubeColor.Yellow, CubeColor.Yellow, CubeColor.Yellow], optional: true, repeatable: false},
        {index: 6, text: '🟨 🟥 → 8 ⭐', colors: [CubeColor.Yellow, CubeColor.Red], optional: false, repeatable: false},
        {index: 7, text: '🟥 → 5 ⭐ ea.', colors: [CubeColor.Red], optional: false, repeatable: true},
      ], 
      special: 'If at least one cube per row: 10 ⭐' 
    });

       const GaAs = led.create(LEDCard, 'ledGaAs' + i, { 
      layers: [
        {index: 1, text: '🟫 → 2 ⭐ ea.', colors: [CubeColor.Brown], optional: false, repeatable: true},
        {index: 2, text: '🟧 →2 ⭐ ea.', colors: [CubeColor.Orange], optional: false, repeatable: true},
        {index: 3, text: '⬛ → 3 ⭐ ea.', colors: [CubeColor.Black], optional: false, repeatable: true},
        {index: 4, text: '✳️ →1 ⭐ ea. ', colors: [CubeColor.Any], optional: false, repeatable: true},
        {index: 5, text: '', colors: [], optional: false, repeatable: false},
        {index: 6, text: '', colors: [], optional: false, repeatable: false},
        {index: 7, text: '', colors: [], optional: false, repeatable: false},
      ]}
    );

    for(var j = 1; j <= 7; j++) {
      led.create(LEDRow, 'row-' + j + '-' + i, {index: j});
    }
  }

  for(var i = 1; i <= 4; i++) {
    const plate = mainBoard.create(CubePlate, "cubePlate" + i, {index: i})
    const funding = mainBoard.create(FundingSpace, "funding" + i, {index: i})
    const upgradeA = mainBoard.create(UpgradeSpace, "upgrade" + i + "-a", {index: i})
    const upgradeB = mainBoard.create(UpgradeSpace, "upgrade" + i + "-b", {index: i})
  }

  const colors: CubeColor[] = [CubeColor.Orange, CubeColor.Brown, CubeColor.Blue, CubeColor.White, 
    CubeColor.Black, CubeColor.Red, CubeColor.Yellow]
  for(var i = 1; i <= 30; i++) {
    for(const color of colors) {
      supply.create(ResourceCube, color + "Cube" + i, {color: color});
    }
  }

  const fundingDeck = game.create(FundingDeck, "fundingDeck");
  for (const fundingCard of fundingCards) {
    fundingDeck.create(FundingCard, fundingCard.name!.replace(' ', '_'), fundingCard);
  }
  fundingDeck.shuffle();

  const upgradeDeck = game.create(UpgradeDeck, "upgradeDeck");
  for (const upgradeCard of upgradeCards) {
    const card = upgradeDeck.create(UpgradeCard, upgradeDeck.name!.replace(' ', '_'), upgradeCard);
    card.initialize();
  }
  upgradeDeck.shuffle();
}
