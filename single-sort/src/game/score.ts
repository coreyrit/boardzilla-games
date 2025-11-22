import {
    Space
} from '@boardzilla/core';
import { MyGame } from "./index.js";
import { Cardboard } from "./component/cardboard.js";
import { Plastic } from "./component/plastic.js";
import { Glass } from "./component/glass.js";
import { Metal } from "./component/metal.js";

import { Goal } from "./component/goal.js";

export class Score extends Space<MyGame> {

  calculateScore() : number{
    let score = 0;
    if(this.owner != undefined) {
      const hand = this.owner!.hand
      
      // score cardboard
      for(let v = 1; v <= 7; v++) {
        score += Math.floor(hand.all(Cardboard, {clean: true, face: v}).length / 2) * v;
      }
      
      // score plastic
      score += hand.all(Plastic, {face: 1}).length * 1;
      score += hand.all(Plastic, {face: 2}).length * 2;
      for(const color of ['darkgreen', 'blue', 'yellow']) {
        for(const val of [3, 5]) {
          if(hand.all(Cardboard, {clean: true, color: color}).reduce((sum, cb) => sum + cb.face, 0) >= val) {
            score += hand.all(Plastic, {face: val, color: color}).length * val;
          }
        }
      }

      const sixCount = hand.all(Plastic, {face: 6}).length;
      if(this.game.players.length == 1) {
        if(sixCount == 1) {
            score += 4;
        } else if(sixCount == 2) {
            score += 10;
        } else if(sixCount > 2) {
            score += 18;
        }
      } else {        
        if(sixCount > 0) {
            let sixCounts: number[] = []
            this.game.players.forEach(p => {
                const count = p.hand.all(Plastic, {face: 6}).length
                if(!sixCounts.includes(count)) {
                    sixCounts.push(count);
                }
            })
            sixCounts.sort((a, b) => b - a);
            if(sixCounts.length > 0 && sixCount == sixCounts[0]) {
                score += (14 - this.game.players.length);
            } else if (sixCounts.length > 1 && sixCount == sixCounts[1]) {
                score += (8 - this.game.players.length);
            }
        }
      }

      // score glass
      let glassCounts: number[] = []
      for(const color of ['darkgreen', 'blue', 'yellow']) {
        glassCounts.push(hand.all(Glass, {color: color}).length);
      }
      glassCounts.sort((a, b) => b - a);
      if(glassCounts.length > 0) {
        score += glassCounts[0] * 5;
      }
      for(let i = 1; i < glassCounts.length; i++) {
        score += glassCounts[i] * 2;
      }

      // score metal
      if(this.game.players.length == 1) {
        score += hand.all(Metal).length * 12
      } else {
        score += hand.all(Metal).length * 14
        if(hand.all(Metal, {color: "#B8860B"}).length > 0) {
            score += hand.all(Plastic, {face: 1}).length * 3;
        }
        if(hand.all(Metal, {color: "#C0C0C0"}).length > 0) {
            score += hand.all(Plastic, {face: 1}).length * 2;
        }
        if(hand.all(Metal, {color: "#8B4513"}).length > 0) {
            score += hand.all(Plastic, {face: 1}).length * 1;
        }
      }

      // private goals
      if(this.game.players.length == 1) {
        // it is ok to see goal scoring mid game
        score += $.trash.all(Cardboard, {face: 5}).length * 5;
      } else {
        if(this.game.isOver) {
            const goal = hand.first(Goal)!;
            for(const val of goal.targetNumbers) {
                score += $.trash.all(Cardboard, {color: goal.targetColor, face: val}).length * val;
            }
        }
      }
    }
    return score;
  }
}
