import { CheckSpace, WorkerSpace } from "../boards.js";
import { Check, Wax, WorkerPiece } from "../components.js";
import { Building, Color, MyGame, SpaceType } from "../index.js";

export class WaxBuilding {

    performPrimvaryColor(game: MyGame, shape: Color, skipShape : Boolean = false) : void{
        if(!game.setup) { 
            game.currentPlayer().gainWax(3); 
            game.message(game.currentPlayer().name + ' takes 3 wax.');
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
                game.message(game.currentPlayer().name + ' takes the ' + shape + ' key.');
            }
        } 
    }

    performSecondaryColor(game: MyGame, shape: Color, skipShape: Boolean = false) : void{
        if(!game.setup) { 
            game.followUp({name: 'chooseWax'}); 
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
                game.message(game.currentPlayer().name + ' takes the ' + shape + ' key.');
            }
        } 
    }

    createWorkerSpaces(game : MyGame) : void {

        const waxRed = game.create(WorkerSpace, 'waxRed', {building: Building.Wax, color: Color.Red, spaceType: SpaceType.Color});
        const waxYellow = game.create(WorkerSpace, 'waxYellow', {building: Building.Wax, color: Color.Yellow, spaceType: SpaceType.Color});
        const waxBlue = game.create(WorkerSpace, 'waxBlue', {building: Building.Wax, color: Color.Blue, spaceType: SpaceType.Color});
      
        waxRed.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Red); });
        waxYellow.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Yellow); });
        waxBlue.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Blue); });

        const waxOrange = game.create(WorkerSpace, 'waxOrange', {building: Building.Wax, color: Color.Orange, spaceType: SpaceType.Color});
        const waxGreen = game.create(WorkerSpace, 'waxGreen', {building: Building.Wax, color: Color.Green, spaceType: SpaceType.Color});
        const waxPurple = game.create(WorkerSpace, 'waxPurple', {building: Building.Wax, color: Color.Purple, spaceType: SpaceType.Color});

        waxOrange.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Orange); });
        waxGreen.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Green); });
        waxPurple.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Purple); });

        const waxRepeater = game.create(WorkerSpace, 'waxRepeater', {building: Building.Wax, spaceType: SpaceType.Mastery});
        const waxMiddle = game.create(WorkerSpace, 'waxMiddle', {building: Building.Wax, spaceType: SpaceType.Middle});
        const waxBackroom = game.create(WorkerSpace, 'waxBackroom', {building: Building.Wax, spaceType: SpaceType.Backroom});
  
        waxRepeater.onEnter(WorkerPiece, x => { 
            waxRepeater.color = x.color;
            game.performMastery(Building.Wax, waxRepeater);
        })
        waxBackroom.onEnter(WorkerPiece, x => { 
            waxBackroom.color = x.color;
            if(!game.setup) {
                game.followUp({name: 'chooseBackroomAction', args: {building: Building.Wax, usedSpaces: []}});
            }
        })
        waxMiddle.onEnter(WorkerPiece, x => { 
            waxMiddle.color = x.color;
            game.followUp({name: 'chooseMiddleAction', args: { workerSpace: waxMiddle }});
        })
  
        const waxSpill = game.create(WorkerSpace, 'waxSpill', {building: Building.Wax, spaceType: SpaceType.Spill});

        waxSpill.onEnter(WorkerPiece, x => {     
            $.waxSpillArea.all(Wax).forEach(x => {
                x.putInto(game.currentPlayer().nextEmptySpace());
            })
            game.currentPlayer().gainWax();
        });
    }
}
