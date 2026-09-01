import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';

/** Hur länge kortet flyger ut innan nästa fråga läggs fram. */
const LEAVE_MS = 260;

/** Hastighet i px/ms som räknas som en knyck även om dragningen är kort. */
const FLING_SPEED = 0.6;

interface Feedback {
  correct: boolean;
  solution: string;
}

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [CdkDrag, MatCardModule],
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.scss',
})
export class GameViewComponent implements OnDestroy {
  @ViewChild(CdkDrag) private drag?: CdkDrag;

  currentStatement: Statement | undefined;
  currentStatmentString = '';
  /** Om påståendet på kortet faktiskt stämmer. */
  currentAnswer = false;
  nrCorrect = 0;
  nrWrong = 0;
  finished = false;
  feedback: Feedback | undefined;

  /** -1 helt åt vänster, 0 i vila, +1 helt åt höger. Driver all dragrespons. */
  progress = 0;
  /** Riktningen kortet flyger ut åt, 0 när det ligger stilla. */
  leaving: -1 | 0 | 1 = 0;
  /** Stänger av övergångar i det ögonblick nästa kort läggs på plats. */
  instant = false;

  private deck: Statement[] = [];
  private n1 = 0;
  private n2 = 0;
  private samples: { x: number; t: number }[] = [];
  private advanceTimer?: ReturnType<typeof setTimeout>;
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.restart();
  }

  ngOnDestroy(): void {
    clearTimeout(this.advanceTimer);
    clearTimeout(this.feedbackTimer);
  }

  /** Sant medan kortet flyger ut — då tas inga nya svar emot. */
  get locked(): boolean {
    return this.leaving !== 0;
  }

  get rotation(): number {
    return this.progress * 12;
  }

  get totalAnswered(): number {
    return this.nrCorrect + this.nrWrong;
  }

  /** 0 när kortet ligger stilla, 1 när det dragits hela vägen åt `dir`. */
  strength(dir: 1 | -1): number {
    return Math.max(0, dir * this.progress);
  }

  numberOfStatementsLeft(): number {
    return this.deck.length + (this.currentStatement ? 1 : 0);
  }

  restart(): void {
    clearTimeout(this.advanceTimer);
    clearTimeout(this.feedbackTimer);
    this.deck = this.shuffle(this.firstLevel);
    this.nrCorrect = 0;
    this.nrWrong = 0;
    this.finished = false;
    this.feedback = undefined;
    this.progress = 0;
    this.leaving = 0;
    this.samples = [];
    this.getNextStatement();
  }

  // --- Dragning -------------------------------------------------------------

  dragMoved($event: CdkDragMove): void {
    // Rotationen ska följa hur långt kortet flyttats, inte var på skärmen
    // fingret råkar befinna sig.
    this.progress = this.clamp($event.distance.x / this.threshold(), -1, 1);

    this.samples.push({ x: $event.distance.x, t: performance.now() });
    if (this.samples.length > 5) {
      this.samples.shift();
    }
  }

  dragEnd($event: CdkDragEnd): void {
    const dx = $event.distance.x;
    const committed =
      Math.abs(dx) >= this.threshold() || (this.isFling() && Math.abs(dx) > 24);
    this.samples = [];

    if (committed) {
      this.answer(dx > 0);
    } else {
      this.progress = 0;
      this.drag?.reset();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown($event: KeyboardEvent): void {
    if ($event.key !== 'ArrowLeft' && $event.key !== 'ArrowRight') {
      return;
    }
    $event.preventDefault();
    this.answer($event.key === 'ArrowRight');
  }

  /** `true` = spelaren svarar att påståendet stämmer (höger), `false` = vänster. */
  answer(saysTrue: boolean): void {
    if (this.locked || this.finished || !this.currentStatement) {
      return;
    }

    const correct = saysTrue === this.currentAnswer;
    if (correct) {
      this.nrCorrect += 1;
    } else {
      this.nrWrong += 1;
      this.buzz();
    }

    // Facit räknas ut innan nästa fråga läggs fram — annars är n1/n2 borta.
    this.feedback = {
      correct,
      solution: `${this.n1} × ${this.n2} = ${this.n1 * this.n2}`,
    };
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(
      () => (this.feedback = undefined),
      correct ? 900 : 1800,
    );

    this.leaving = saysTrue ? 1 : -1;
    this.progress = saysTrue ? 1 : -1;
    this.advanceTimer = setTimeout(() => this.settleNextCard(), LEAVE_MS);
  }

  private settleNextCard(): void {
    this.getNextStatement();
    this.leaving = 0;
    this.progress = 0;
    // Utan detta skulle kortet animeras tillbaka in från kanten det for ut åt.
    this.instant = true;
    this.drag?.reset();
    requestAnimationFrame(() => (this.instant = false));
  }

  /** Tröskeln skalar med skärmen så att svepet känns lika på mobil och desktop. */
  private threshold(): number {
    return this.clamp(window.innerWidth * 0.22, 60, 130);
  }

  private isFling(): boolean {
    if (this.samples.length < 2) {
      return false;
    }
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = last.t - first.t;
    return dt > 0 && Math.abs((last.x - first.x) / dt) > FLING_SPEED;
  }

  private buzz(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(60);
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  // --- Frågor ---------------------------------------------------------------

  private getNextStatement(): void {
    this.currentStatement = this.deck.pop();

    if (!this.currentStatement) {
      this.currentStatmentString = '';
      this.finished = true;
      return;
    }

    const statement = this.currentStatement;
    const flip = Math.random() < 0.5;
    this.n1 = flip ? statement.number1 : statement.number2;
    this.n2 = flip ? statement.number2 : statement.number1;

    // 0 × 0 är enda frågan utan eget fel-alternativ. Utan reserven nedan
    // skulle den alltid visas korrekt, och andelen sanna påståenden landa på
    // 51,7 % i stället för 50/50.
    const wrong = statement.wrongs.length
      ? statement.wrongs[Math.floor(Math.random() * statement.wrongs.length)]
      : statement.answer + 1;
    const shown = Math.random() < 0.5 ? statement.answer : wrong;

    this.currentAnswer = this.n1 * this.n2 === shown;
    this.currentStatmentString = `${this.n1} × ${this.n2} = ${shown}`;
  }

  /** Fisher-Yates på en kopia — sort() med slumpjämförare är varken jämn
   *  fördelning eller fri från att skriva sönder källistan. */
  private shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  private readonly firstLevel: readonly Statement[] = [
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
  wrongs: number[];
}
