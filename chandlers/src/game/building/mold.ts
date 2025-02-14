import { KeyHook, WorkerSpace } from "../boards.js";
import { Check, KeyShape, Melt, Wax, WorkerPiece } from "../components.js";
import { Building, Color, MyGame, SpaceType } from "../index.js";

export class MoldBuilding {

    performPrimvaryColor(game: MyGame, shape: Color, skipShape : boolean = false) : void{
        if(!game.setup) { 
            game.followUp({name: 'choose' + game.capitalize(shape) + 'OrWhiteMelt'}); 
            if(!skipShape && game.all(KeyHook, {color: shape}).all(KeyShape).length > 0) {
                game.currentPlayer().gainShape(shape); 
                game.message(game.currentPlayer().name + ' takes the ' + shape + ' key.');
            }
        }
    }
    
    performSecondaryColor(game: MyGame, shape: Color, skipShape : boolean = false) : void{
        if(!game.setup) { 
            game.followUp({name: 'choose' + game.capitalize(shape) + 'OrBlackMelt'}); 
            if(!skipShape && game.all(KeyHook, {color: shape}).all(KeyShape).length > 0) {
                game.currentPlayer().gainShape(shape); 
                game.message(game.currentPlayer().name + ' takes the ' + shape + ' key.');
            }
        }
    }

    createWorkerSpaces(game : MyGame) : void {

        const moldRed = game.create(WorkerSpace, 'moldRed', {building: Building.Mold, color: Color.Red, spaceType: SpaceType.Color});
        const moldYellow = game.create(WorkerSpace, 'moldYellow', {building: Building.Mold, color: Color.Yellow, spaceType: SpaceType.Color});
        const moldBlue = game.create(WorkerSpace, 'moldBlue', {building: Building.Mold, color: Color.Blue, spaceType: SpaceType.Color});
      
        moldRed.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Red) });
        moldYellow.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Yellow) });
        moldBlue.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Blue) });
      
        const moldOrange = game.create(WorkerSpace, 'moldOrange', {building: Building.Mold, color: Color.Orange, spaceType: SpaceType.Color});
        const moldGreen = game.create(WorkerSpace, 'moldGreen', {building: Building.Mold, color: Color.Green, spaceType: SpaceType.Color});
        const moldPurple = game.create(WorkerSpace, 'moldPurple', {building: Building.Mold, color: Color.Purple, spaceType: SpaceType.Color});
      
        moldOrange.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Orange) });
        moldGreen.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Green) });
        moldPurple.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Purple) });
        
        const moldRepeater = game.create(WorkerSpace, 'moldRepeater', {building: Building.Mold, spaceType: SpaceType.Mastery});
        const moldMiddle = game.create(WorkerSpace, 'moldMiddle', {building: Building.Mold, spaceType: SpaceType.Middle});
        const moldBackroom = game.create(WorkerSpace, 'moldBackroom', {building: Building.Mold, spaceType: SpaceType.Backroom});
      
        moldRepeater.onEnter(WorkerPiece, x => {         
            moldRepeater.color = x.color;
            game.performMastery(Building.Mold, moldRepeater);
        })
        moldBackroom.onEnter(WorkerPiece, x => { 
            moldBackroom.color = x.color;
            if(!game.setup) {
                game.followUp({name: 'chooseBackroomAction', args: {building: Building.Mold, usedSpaces: []}});
            }
        })
        moldMiddle.onEnter(WorkerPiece, x => { 
            moldMiddle.color = x.color;
            game.followUp({name: 'chooseMiddleAction', args: { workerSpace: moldMiddle }});
        })

        const moldSpill = game.create(WorkerSpace, 'moldSpill', {building: Building.Mold, spaceType: SpaceType.Spill});

        moldSpill.onEnter(WorkerPiece, x => {    
            game.currentPlayer().increaseScore(); 
            if($.meltSpillArea.all(Melt).length > 0 && game.currentPlayer().board.all(Wax).length > 0) {
                game.followUp({name: 'chooseSpiltMelts'});
            }
        });
    }

}
