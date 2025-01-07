import { WorkerSpace } from "../boards.js";
import { CustomerCard, WorkerPiece, Pigment } from "../components.js";
import { Building, Color, MyGame } from "../index.js";

export class PigmentBuilding {

    performPrimvaryColor(game: MyGame, shape: Color, skipShape: Boolean = false ) : void{
        if(!game.setup) { 
            game.followUp({name: 'chooseMeltMany' + game.capitalize(shape)}); 
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
            }
        }
    }

    getDerivedColors(color : Color) : Color[] {
        switch(color) {
            case Color.Orange: {
                return [Color.Red, Color.Yellow]
            }
            case Color.Green: {
                return [Color.Yellow, Color.Blue]
            }
            case Color.Purple: {
                return [Color.Blue, Color.Red]
            }
        }
        return []
    }

    performSecondaryColor(game: MyGame, shape: Color, skipShape: Boolean = false ) : void{
        if(!game.setup) { 
            const mix: Color[] = this.getDerivedColors(shape);
            game.followUp({name: 'chooseMelt' + game.capitalize(mix[0])}); 
            game.followUp({name: 'chooseMelt' + game.capitalize(mix[1])}); 
            if(!skipShape) {
                game.currentPlayer().gainShape(shape); 
            }
        }
    }

    createWorkerSpaces(game : MyGame) : void {
        const pigmentRed = game.create(WorkerSpace, 'pigmentRed', {building: Building.Pigment, color: Color.Red});
        const pigmentYellow = game.create(WorkerSpace, 'pigmentYellow', {building: Building.Pigment, color: Color.Yellow});
        const pigmentBlue = game.create(WorkerSpace, 'pigmentBlue', {building: Building.Pigment, color: Color.Blue});
      
        pigmentRed.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Red) });
        pigmentYellow.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Yellow) });
        pigmentBlue.onEnter(WorkerPiece, x => { this.performPrimvaryColor(game, Color.Blue) });

        const pigmentOrange = game.create(WorkerSpace, 'pigmentOrange', {building: Building.Pigment, color: Color.Orange});
        const pigmentGreen = game.create(WorkerSpace, 'pigmentGreen', {building: Building.Pigment, color: Color.Green});
        const pigmentPurple = game.create(WorkerSpace, 'pigmentPurple', {building: Building.Pigment, color: Color.Purple});

        pigmentOrange.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Orange) });
        pigmentGreen.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Green) });
        pigmentPurple.onEnter(WorkerPiece, x => { this.performSecondaryColor(game, Color.Purple) });

        const pigmentRepeater = game.create(WorkerSpace, 'pigmentRepeater', {building: Building.Pigment});
        const pigmentMiddle = game.create(WorkerSpace, 'pigmentMiddle', {building: Building.Pigment});
        const pigmentBackroom = game.create(WorkerSpace, 'pigmentBackroom', {building: Building.Pigment});

        pigmentRepeater.onEnter(WorkerPiece, x => { game.performMastery(Building.Pigment, pigmentRepeater); })
        pigmentBackroom.onEnter(WorkerPiece, x => { game.performBackroom(Building.Pigment, pigmentBackroom); })
        pigmentMiddle.onEnter(WorkerPiece, x => { game.performMiddle(Building.Pigment, pigmentMiddle); })

        const pigmentSpill = game.create(WorkerSpace, 'pigmentSpill', {building: Building.Pigment});

        pigmentSpill.onEnter(WorkerPiece, x => {     
            // draw a random customer
            $.drawCustomer.top(CustomerCard)?.putInto($.playerSpace);
            if($.pigmentSpillArea.all(Pigment).length > 0) {
                game.followUp({name: 'chooseSpiltPigment'})
            }
        });
    }
}
