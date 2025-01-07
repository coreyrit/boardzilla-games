import { WorkerSpace } from "../boards.js";
import { WorkerPiece } from "../components.js";
import { Building, Color, MyGame } from "../index.js";

export class MoldBuilding {

    performPrimvaryColor(game: MyGame, shape: Color, skipShape : Boolean = false) : void{
        if(!game.setup) { 
            game.followUp({name: 'choose' + game.capitalize(shape) + 'OrWhiteMelt'}); 
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
            }
        }
    }
    
    performSecondaryColor(game: MyGame, shape: Color, skipShape : Boolean = false) : void{
        if(!game.setup) { 
            game.followUp({name: 'choose' + game.capitalize(shape) + 'OrBlackMelt'}); 
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
            }
        }
    }

    createWorkerSpaces(game : MyGame) : void {

        const moldRed = game.create(WorkerSpace, 'moldRed', {building: Building.Mold, color: Color.Red});
        const moldYellow = game.create(WorkerSpace, 'moldYellow', {building: Building.Mold, color: Color.Yellow});
        const moldBlue = game.create(WorkerSpace, 'moldBlue', {building: Building.Mold, color: Color.Blue});
      
        moldRed.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Red) });
        moldYellow.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Yellow) });
        moldBlue.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Blue) });
      
        const moldOrange = game.create(WorkerSpace, 'moldOrange', {building: Building.Mold, color: Color.Orange});
        const moldGreen = game.create(WorkerSpace, 'moldGreen', {building: Building.Mold, color: Color.Green});
        const moldPurple = game.create(WorkerSpace, 'moldPurple', {building: Building.Mold, color: Color.Purple});
      
        moldOrange.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Orange) });
        moldGreen.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Green) });
        moldPurple.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Purple) });
        
        const moldRepeater = game.create(WorkerSpace, 'moldRepeater', {building: Building.Mold});
        const moldMiddle = game.create(WorkerSpace, 'moldMiddle', {building: Building.Mold});
        const moldBackroom = game.create(WorkerSpace, 'moldBackroom', {building: Building.Mold});
      
        moldRepeater.onEnter(WorkerPiece, x => { game.performMastery(Building.Mold, moldRepeater); })
        moldBackroom.onEnter(WorkerPiece, x => { game.performBackroom(Building.Mold, moldBackroom); })
        moldMiddle.onEnter(WorkerPiece, x => { game.performMiddle(Building.Mold, moldMiddle); })

        const moldSpill = game.create(WorkerSpace, 'moldSpill', {building: Building.Mold});
    }

}
