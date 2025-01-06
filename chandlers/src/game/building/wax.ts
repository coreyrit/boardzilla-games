import { Building, Color, MyGame, Wax, Worker, WorkerSpace } from "../index.js";

export class WaxBuilding {

    performPrimvaryColor(game: MyGame, shape: Color) : void{
        if(!game.setup) { 
            game.currentPlayer().gainWax(3); 
            game.currentPlayer().gainShape(shape); 
        } 
    }

    performSecondaryColor(game: MyGame, shape: Color) : void{
        if(!game.setup) { 
            game.followUp({name: 'chooseWax'}); 
            game.currentPlayer().gainShape(shape); 
        } 
    }

    createWorkerSpaces(game : MyGame) : void {

        const waxRed = game.create(WorkerSpace, 'waxRed', {building: Building.Wax, color: Color.Red});
        const waxYellow = game.create(WorkerSpace, 'waxYellow', {building: Building.Wax, color: Color.Yellow});
        const waxBlue = game.create(WorkerSpace, 'waxBlue', {building: Building.Wax, color: Color.Blue});
      
        waxRed.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Red); });
        waxYellow.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Yellow); });
        waxBlue.onEnter(Worker, x => { this.performPrimvaryColor(game, Color.Blue); });

        const waxOrange = game.create(WorkerSpace, 'waxOrange', {building: Building.Wax, color: Color.Orange});
        const waxGreen = game.create(WorkerSpace, 'waxGreen', {building: Building.Wax, color: Color.Green});
        const waxPurple = game.create(WorkerSpace, 'waxPurple', {building: Building.Wax, color: Color.Purple});

        waxOrange.onEnter(Worker, x => { this.performSecondaryColor(game, Color.Orange); });
        waxGreen.onEnter(Worker, x => { this.performSecondaryColor(game, Color.Green); });
        waxPurple.onEnter(Worker, x => { this.performSecondaryColor(game, Color.Purple); });

        const waxRepeater = game.create(WorkerSpace, 'waxRepeater', {building: Building.Wax});
        const waxMiddle = game.create(WorkerSpace, 'waxMiddle', {building: Building.Wax});
        const waxBackroom = game.create(WorkerSpace, 'waxBackroom', {building: Building.Wax});
  
        waxRepeater.onEnter(Worker, x => { game.performMastery(Building.Wax, waxRepeater); })
        waxBackroom.onEnter(Worker, x => {
            ($.waxBackroom as WorkerSpace).color = x.color;
            game.performBackroom(Building.Wax);
        })
        waxMiddle.onEnter(Worker, x => {
            ($.waxMiddle as WorkerSpace).color = x.color;
            game.followUp({name: 'chooseMiddleAction', args: { building: Building.Wax }});
        })
  
        const waxSpill = game.create(WorkerSpace, 'waxSpill', {building: Building.Wax});

        waxSpill.onEnter(Worker, x => {     
            $.waxSpillArea.all(Wax).forEach(x => {
                x.putInto(game.currentPlayer().nextEmptySpace());
            })
            game.currentPlayer().gainWax();
        });
    }
}
