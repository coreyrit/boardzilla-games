import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export class DyngusDayPlayer extends Player<MyGame, DyngusDayPlayer> {
  space: PlayerSpace
  collections: Collection[]

  getBestScore() : number {
    return this.collections
      .map(x => x.first(Score)!.getBestScore())
      .reduce((acc, cur) => cur > acc ? cur : acc, -1000)
  }

  getWorstScore() : number {
    return this.collections
      .map(x => x.first(Score)!.getBestScore())
      .reduce((acc, cur) => cur < acc ? cur : acc, 1000)
  }
}

export class PlayerSpace extends Space<MyGame> {
  player: DyngusDayPlayer
}

export class Collection extends Space<MyGame> {
}

export class Deck extends Space<MyGame> {
}

export class Score extends Piece<MyGame> {

  countType(food: Food, extraFood : Food = Food.None) {
    const collection = this.container(Collection)!
    return collection.all(SplashCard, {rotation: 180})
      .map(x => x.food.includes(food) ? 1 : 0)
      .reduce((acc, cur) => acc + cur, 0) + (food == extraFood ? 1 : 0)
  }

  hasWild() : boolean {
    const collection = this.container(Collection)!
    return collection.all(PussyWillowCard, {rotation: 180}).length > 0
  }

  getScore(extraFood: Food = Food.None, print: boolean = false) : number {
    let score : number = 0

    // pierogis
    const pierogis = (Math.floor(this.countType(Food.Pierogi, extraFood) / 2)) * 3
    if(print) { this.game.message(this.name + ' pierogies scored: ' + pierogis) }
    score += pierogis

    // kielbasa
    let kielbasas = 0
    switch(this.countType(Food.Kielbasa, extraFood)) {
      case 1: { kielbasas = 4; break; }
      case 2: { kielbasas = 3; break; }
    }    
    if(print) { this.game.message(this.name + ' kielbasas scored: ' + kielbasas) }
    score += kielbasas

    // sauerkraut
    const sauerkrauts = this.countType(Food.Sauerkraut, extraFood) > 0 ? 1 : -1    
    if(print) { this.game.message(this.name + ' sauerkrauts scored: ' + sauerkrauts) }
    score += sauerkrauts

    // bigos
    const bigos = this.countType(Food.Bigos, extraFood) * 
      Math.min(this.countType(Food.Sauerkraut), this.countType(Food.Kielbasa)) * 2    
    if(print) { this.game.message(this.name + ' bigos scored: ' + bigos) }
    score += bigos

    // piwo
    const piwos = this.countType(Food.Piwo, extraFood)
    if(print) { this.game.message(this.name + ' piwos scored: ' + piwos) }
    score += piwos

    // kolacky
    let kolackys = 0
    const myKolackyCount = this.countType(Food.Kolacky, extraFood)
    const maxKolakckyCount = this.game.all(Score)
      .map(x => {
          if(x != this && x.hasWild()) { 
            return x.getScore(Food.Kolacky) == x.getBestScore() ? x.countType(Food.Kolacky) + 1 : x.countType(Food.Kolacky)
          } else if ( x != this) {
            return x.countType(Food.Kolacky)
          } else {
            return 0
          }
        }
      ).reduce((acc, cur) => cur > acc ? cur: acc, 0)
    if(myKolackyCount > maxKolakckyCount) {
      kolackys = 3
    } else if(myKolackyCount == maxKolakckyCount && maxKolakckyCount > 0) {
      kolackys = 2
    }
    if(print) { this.game.message(this.name + ' kolackys scored: ' + kolackys) }
    score += kolackys

    return score;
  }

  getBestScore(print: boolean = false) : number {
    if(this.hasWild()) {
      return [Food.Bigos, Food.Kielbasa, Food.Kolacky, Food.Pierogi, Food.Piwo, Food.Sauerkraut]
        .map(x => {
          if(print) {
            this.game.message('Option for ' + x); 
          }
          return this.getScore(x, print);
        })
        .reduce((acc, cur) => cur > acc ? cur : acc, 0)
    } else {
      return this.getScore(Food.None, print)
    }
  }

  override toString(): string {    
    return  this.getBestScore().toString()
  }
}


export class Card extends Piece<MyGame> {
  order: number = 0.0  
  flipped: boolean = false
}

enum Food {
  Pierogi = 'pierogi',
  Kielbasa = 'kielbasa',
  Sauerkraut = 'sauerkraut',
  Bigos = 'bigos',
  Piwo = 'piwo',
  Kolacky = 'kolacky',
  None = 'none'
}

export class SplashCard extends Card {
  food : Food[]
}
export class PussyWillowCard extends Card {
}
export class PolkaCard extends Card {
}
export class FirstPlayerCard extends Piece<MyGame> {
}

class MyGame extends Game<MyGame, DyngusDayPlayer> {
  createSplashCard(f1: Food, f2: Food) {
    const fc = $.deck.create(SplashCard, f1 + '-' + f2)
    fc.food = [f1, f2]
  }
}

export default createGame(DyngusDayPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, forLoop, whileLoop } = game.flowCommands;

  for(let i = 1; i <= game.players.length; i++) {
    const space = game.players[i-1].space = game.create(PlayerSpace, 'player-' + i)
    space.onEnter(Card, x => {
      x.flipped = true;
    })
    space.player = game.players[i-1]    
  }

  for(let i = 1; i <= 4; i++) {
    const col = game.create(Collection, 'collection-' + i)
    col.create(Score, 'score-' + i)
    col.onEnter(Card, x => {
      x.flipped = true;
    })
  }

  // assign collections
  switch(game.players.length) {
    case 1: {
      game.players[0].collections = game.all(Collection)
      break;
    }
    case 2: {
      game.players[0].collections = [game.first(Collection, {name: 'collection-1'})!, game.first(Collection, {name: 'collection-2'})!]
      game.players[1].collections = [game.first(Collection, {name: 'collection-3'})!, game.first(Collection, {name: 'collection-4'})!]
      break;
    }
    case 3: {
      game.players[0].collections = [game.first(Collection, {name: 'collection-1'})!, game.first(Collection, {name: 'collection-2'})!]
      game.players[1].collections = [game.first(Collection, {name: 'collection-2'})!, game.first(Collection, {name: 'collection-3'})!]
      game.players[2].collections = [game.first(Collection, {name: 'collection-3'})!, game.first(Collection, {name: 'collection-1'})!]
      break;
    }
    case 4: {
      game.players[0].collections = [game.first(Collection, {name: 'collection-1'})!, game.first(Collection, {name: 'collection-2'})!]
      game.players[1].collections = [game.first(Collection, {name: 'collection-2'})!, game.first(Collection, {name: 'collection-3'})!]
      game.players[2].collections = [game.first(Collection, {name: 'collection-3'})!, game.first(Collection, {name: 'collection-4'})!]
      game.players[3].collections = [game.first(Collection, {name: 'collection-4'})!, game.first(Collection, {name: 'collection-1'})!]
      break;
    }
  }

  game.create(Deck, 'deck')  
  $.deck.onEnter(Card, x => {
    x.flipped = false;
  })

  // create all combinations of food
  game.createSplashCard(Food.Pierogi, Food.Kielbasa)
  game.createSplashCard(Food.Pierogi, Food.Sauerkraut)
  game.createSplashCard(Food.Pierogi, Food.Bigos)
  game.createSplashCard(Food.Pierogi, Food.Piwo)
  game.createSplashCard(Food.Pierogi, Food.Kolacky)
  game.createSplashCard(Food.Kielbasa, Food.Sauerkraut)
  game.createSplashCard(Food.Kielbasa, Food.Bigos)
  game.createSplashCard(Food.Kielbasa, Food.Piwo)
  game.createSplashCard(Food.Kielbasa, Food.Kolacky)
  game.createSplashCard(Food.Sauerkraut, Food.Bigos)
  game.createSplashCard(Food.Sauerkraut, Food.Piwo)
  game.createSplashCard(Food.Sauerkraut, Food.Kolacky)
  game.createSplashCard(Food.Bigos, Food.Piwo)
  game.createSplashCard(Food.Bigos, Food.Kolacky)
  game.createSplashCard(Food.Piwo, Food.Kolacky)
  // create other cards
  $.deck.create(PussyWillowCard, 'pussy-willow')
  $.deck.create(PolkaCard, 'polka')
  // there is also a first player card
  game.players[0].space!.create(FirstPlayerCard, 'first-player')
  

  game.defineActions({
    drawCard: (player) => action({
      prompt: 'Draw next card',
    }).chooseOnBoard(
      'card', [$.deck.bottom(Card)!],
      { skipIf: 'never' }
    ).do(({ card }) => {
      card.putInto(player.space)
    }),

    chooseCollection: (player) => action({
      prompt: 'Choose a collection',
    }).chooseOnBoard(
      'collection', game.all(Collection).filter(x => x.all(Card).length < 4),
      { skipIf: 'never' }
    ).do(({ collection }) => {
      player.space.first(Card)!.putInto(collection);
    }),
  });

  game.defineFlow(

    // loop(playerActions({ actions: []}))    
    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 4, do: [

      // the player with the first player card goes first
      () => game.players.setCurrent(game.first(FirstPlayerCard)!.container(PlayerSpace)!.player),

      // shufle the deck
      () => $.deck.shuffle(),

      whileLoop({while: () => game.all(Collection).all(Card).length < 16, do: ([
        playerActions({ actions: ['drawCard']}),
        playerActions({ actions: ['chooseCollection']}),
        () => game.players.next()
      ])}),

      // randomly lock a card in each collection
      () => {
        game.all(Collection).forEach(col => {
          col.all(Card, {rotation: 0}).forEach(c => c.order = game.random())
          col.all(Card, {rotation: 0}).sortBy('order')          
          let rando = col.first(Card, {rotation: 0})!
          if(rando.name == 'polka') {
            // swap the polka card with the last card in the deck
            let polka = rando
            rando = $.deck.first(Card)!
            rando.putInto(polka.container(Collection)!)
            polka.putInto($.deck)
          }
          // lock in the card
          rando.rotation = 180            
        });
      },      

      // return all cards to the deck
      () => game.all(Card, {rotation: 0}).forEach(x => x.putInto($.deck)),

      // move the first player card
      () => {
        const firstPlayerCard = game.first(FirstPlayerCard)!
        const firstPlayer = firstPlayerCard.container(PlayerSpace)!.player
        let index = game.players.indexOf(firstPlayer)
        index++
        if(index >= game.players.length) {
          index = 0
        }
        firstPlayerCard.putInto(game.players[index].space)
      },

      // print final scores
      // () => {
        // game.all(Score).forEach(x => x.getBestScore(true));
      // }
     ]}),  

     () => {
              // find the winner
              let winners : DyngusDayPlayer[] = []
              const winningScore = game.players
                .map(x => x.getWorstScore())
                .reduce((acc, cur) => cur > acc ? cur : acc, -1000)

              game.players.forEach(x => {
                const score = x.getWorstScore()                
                game.message('The best score for ' + x.name + ' is ' + score + '.');
                if(score == winningScore) {
                  winners.push(x)
                }
              })
      
              // tie breaker        
              if(winners.length > 1) {
                // reset the winners
                const tied = winners
                winners = []
                const otherWinningScore = tied
                  .map(x => x.getBestScore())
                  .reduce((acc, cur) => cur > acc ? cur : acc, -1000)

                tied.forEach(x => {
                  const score = x.getBestScore()
                  game.message('The other score for ' + x.name + ' is ' + score + '.');
                  if(score == otherWinningScore) {
                    winners.push(x)
                  }
                })
              }
      
              // end the game
              game.finish(winners)
     },
    )
});
