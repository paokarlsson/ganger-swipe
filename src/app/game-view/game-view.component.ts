import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [CdkDrag, MatCardModule],
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.scss',
})
export class GameViewComponent {
  dragTransform: any;
  dragMoved($event: CdkDragMove) {
    const x = $event.pointerPosition.x;
    const offsetX = x - window.innerWidth / 2;
    const rotation = offsetX / 20;
    const translateX = $event.distance.x;
    const translateY = $event.distance.y;

    this.dragTransform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;

  }
  dragEnd($event: CdkDragEnd<any>) {
      if($event.distance.x > 100) {
          this.clickTrue()
        } else if ($event.distance.x < -100) {
        this.clickFalse()
      }
      this.dragTransform = '';
  }
  currentStatement: Statement | undefined;
  currentAnswer: boolean = false;
  currentStatmentString: string = '';
  shuffled: Statement[];
  nrCorrect: number = 0;
  nrWrong: number = 0;

  clickFalse() {
    if (this.currentAnswer == false) {
      this.nrCorrect += 1;
    } else {
      this.nrWrong += 1;
    }
    this.getNextStatement();
  }
  constructor() {
    this.shuffled = this.createStatements();
    this.getNextStatement();
    // this.currentStatement = this.shuffled.pop();
  }
  clickTrue() {
    if (this.currentAnswer == true) {
      this.nrCorrect += 1;
    } else {
      this.nrWrong += 1;
    }
    this.getNextStatement();
  }

  numberOfStatementsLeft(): number {
    return this.shuffled.length + +(this.currentStatement != undefined);
  }
  getNextStatement() {
    this.currentStatement = this.shuffled.pop();
    const order = Math.random() < 0.5;
    let n1;
    let n2;
    let a;
    if (order) {
      n1 = this.currentStatement?.number1;
      n2 = this.currentStatement?.number2;
    } else {
      n2 = this.currentStatement?.number1;
      n1 = this.currentStatement?.number2;
    }

    const right = Math.random() < 0.7;
    if (this.currentStatement?.wrongs.length == 0 || right) {
      a = this.currentStatement?.answer;
    } else {
      a = this.currentStatement?.wrongs.sort(() => Math.random() - 0.5).pop();
    }

    if (n1 != undefined && n2 != undefined && a != undefined) {
      this.currentAnswer = n1 * n2 == a;
      this.currentStatmentString = n1 + ' * ' + n2 + ' = ' + a;
    } else {
      this.currentStatmentString = '';
    }
  }

  createStatements(): Statement[] {
    return this.firstLevel.sort(() => Math.random() - 0.5);
  }

  firstLevel: Statement[] = [
    {
      rank: 1,
      number1: 0,
      number2: 0,
      answer: 0,
      wrongs: [],
    },
    {
      rank: 2,
      number1: 0,
      number2: 1,
      answer: 0,
      wrongs: [1],
    },
    {
      rank: 3,
      number1: 0,
      number2: 2,
      answer: 0,
      wrongs: [2],
    },
    {
      rank: 4,
      number1: 0,
      number2: 3,
      answer: 0,
      wrongs: [3],
    },
    {
      rank: 5,
      number1: 0,
      number2: 4,
      answer: 0,
      wrongs: [4],
    },
    {
      rank: 6,
      number1: 0,
      number2: 5,
      answer: 0,
      wrongs: [5],
    },
    {
      rank: 7,
      number1: 0,
      number2: 6,
      answer: 0,
      wrongs: [6],
    },
    {
      rank: 8,
      number1: 0,
      number2: 7,
      answer: 0,
      wrongs: [7],
    },
    {
      rank: 9,
      number1: 0,
      number2: 8,
      answer: 0,
      wrongs: [8],
    },
    {
      rank: 10,
      number1: 0,
      number2: 9,
      answer: 0,
      wrongs: [9],
    },
    {
      rank: 11,
      number1: 0,
      number2: 10,
      answer: 0,
      wrongs: [10],
    },
    {
      rank: 12,
      number1: 1,
      number2: 0,
      answer: 0,
      wrongs: [1],
    },
    {
      rank: 13,
      number1: 1,
      number2: 1,
      answer: 1,
      wrongs: [0],
    },
    {
      rank: 14,
      number1: 1,
      number2: 2,
      answer: 2,
      wrongs: [1],
    },
    {
      rank: 15,
      number1: 1,
      number2: 3,
      answer: 3,
      wrongs: [1],
    },
    {
      rank: 16,
      number1: 1,
      number2: 4,
      answer: 4,
      wrongs: [1],
    },
    {
      rank: 17,
      number1: 1,
      number2: 5,
      answer: 5,
      wrongs: [1],
    },
    {
      rank: 18,
      number1: 1,
      number2: 6,
      answer: 6,
      wrongs: [1],
    },
    {
      rank: 19,
      number1: 1,
      number2: 7,
      answer: 7,
      wrongs: [1],
    },
    {
      rank: 20,
      number1: 1,
      number2: 8,
      answer: 8,
      wrongs: [1],
    },
    {
      rank: 21,
      number1: 1,
      number2: 9,
      answer: 9,
      wrongs: [1],
    },
    {
      rank: 22,
      number1: 1,
      number2: 10,
      answer: 10,
      wrongs: [1],
    },
    {
      rank: 23,
      number1: 2,
      number2: 0,
      answer: 0,
      wrongs: [2],
    },
    {
      rank: 24,
      number1: 2,
      number2: 1,
      answer: 2,
      wrongs: [1],
    },
    {
      rank: 25,
      number1: 2,
      number2: 2,
      answer: 4,
      wrongs: [2],
    },
    {
      rank: 26,
      number1: 2,
      number2: 3,
      answer: 6,
      wrongs: [5],
    },
    {
      rank: 27,
      number1: 2,
      number2: 4,
      answer: 8,
      wrongs: [6],
    },
    {
      rank: 28,
      number1: 2,
      number2: 5,
      answer: 10,
      wrongs: [8],
    },
    {
      rank: 29,
      number1: 2,
      number2: 6,
      answer: 12,
      wrongs: [10],
    },
    {
      rank: 30,
      number1: 2,
      number2: 7,
      answer: 14,
      wrongs: [12],
    },
  ];
}

export interface Statement {
  rank: number;
  number1: number;
  number2: number;
  answer: number;
  wrongs: [number] | [];
}
