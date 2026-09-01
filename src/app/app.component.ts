import { Component } from '@angular/core';
import { GameViewComponent } from './game-view/game-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameViewComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
