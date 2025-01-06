import { Building, Color, MyGame, Worker, WorkerSpace } from "../index.js";

export class PigmentBuilding {

    capitalize(color: Color) : string {
        return color.toString().charAt(0).toUpperCase() + color.toString().substring(1)
    }

    performPrimvaryColor(game: MyGame, shape: Color) : void{
        if(!game.setup) { 
            game.followUp({name: 'chooseMeltMany' + this.capitalize(shape)}); 
            game.currentPlayer().gainShape(shape); 
        }
    }

    performSecondoaryColor(game: MyGame, shape: Color, mix1: Color, mix2: Color) : void{
        if(!game.setup) { 
            game.followUp({name: 'chooseMelt' + this.capitalize(mix1)}); 
            game.followUp({name: 'chooseMelt' + this.capitalize(mix2)}); 
            game.currentPlayer().gainShape(Color.Orange); 
        }
    }

    createWorkerSpaces(game : MyGame) : void {
        const pigmentRed = game.create(WorkerSpace, 'pigmentRed', {building: Building.Pigment, color: Color.Red});
        const pigmentYellow = game.create(WorkerSpace, 'pigmentYellow', {building: Building.Pigment, color: Color.Yellow});
        const pigmentBlue = game.create(WorkerSpace, 'pigmentBlue', {building: Building.Pigment, color: Color.Blue});
      
        pigmentRed.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Red) });
        pigmentYellow.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Yellow) });
        pigmentBlue.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Blue) });

        const pigmentOrange = game.create(WorkerSpace, 'pigmentOrange', {building: Building.Pigment, color: Color.Orange});
        const pigmentGreen = game.create(WorkerSpace, 'pigmentGreen', {building: Building.Pigment, color: Color.Green});
        const pigmentPurple = game.create(WorkerSpace, 'pigmentPurple', {building: Building.Pigment, color: Color.Purple});

        pigmentOrange.onEnter(Worker, x => { this.performSecondoaryColor(game, Color.Orange, Color.Red, Color.Yellow) });
        pigmentGreen.onEnter(Worker, x => { this.performSecondoaryColor(game, Color.Green, Color.Yellow, Color.Blue) });
        pigmentPurple.onEnter(Worker, x => { this.performSecondoaryColor(game, Color.Purple, Color.Blue, Color.Red) });
    }
}
