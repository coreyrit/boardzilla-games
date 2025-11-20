import { Material, Component } from "./component.js";

export class Plastic extends Component {
//   public static Face = class Face {
//     static One = new this(1, "\u2680");
//     static Two = new this(2, "\u2681");
//     static Three = new this(3, "\u2682");
//     static Four = new this(4, "\u2683");
//     static Five = new this(5, "\u2684");
//     static Six = new this(6, "\u2685");

//     constructor(public value: number, public text: string) {}

//     static values(): Plastic.Face[] {
//       return [
//         Plastic.Face.One,
//         Plastic.Face.Two,
//         Plastic.Face.Three,
//         Plastic.Face.Four,
//         Plastic.Face.Five,
//         Plastic.Face.Six,
//       ];
//     }
//   };

//   private face: Plastic.Face;
//   private textColor: string;

//   private constructor(game: Game, color: string, textColor: string) {
//     super(game);
//     this.color = color;
//     this.textColor = textColor;
//     this.roll(); // Randomize the face to start
//   }

//   public roll(): void {
//     const faces = Plastic.Face.values();
//     this.face = faces[Math.floor(Math.random() * faces.length)];
//   }

//   public getFace(): Plastic.Face {
//     return this.face;
//   }

//   public static createGreenPlastic(game: Game): Plastic {
//     return new Plastic(game, "darkgreen", "white");
//   }

//   public static createBluePlastic(game: Game): Plastic {
//     return new Plastic(game, "blue", "white");
//   }

//   public static createYellowPlastic(game: Game): Plastic {
//     return new Plastic(game, "yellow", "black");
//   }

//   public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
//     ctx.fillStyle = this.color;
//     ctx.fillRect(x + 15, y + 15, 70, 70);

//     ctx.font = "100px Arial";
//     ctx.fillStyle = this.textColor;
//     ctx.fillText(this.face.text, x + 5, y + 85);

//     ctx.strokeStyle = this.color;
//     ctx.lineWidth = 8;
//     ctx.strokeRect(x + 17, y + 17, 64, 64);

//     this.setStroke(ctx);

//     ctx.strokeRect(x + 15, y + 15, 70, 70);
//   }

  public getMaterial(): Material {
    return Material.Plastic;
  }
}