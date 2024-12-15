import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwipeComponent } from './swipe/swipe.component';
import { GameViewComponent } from './game-view/game-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'math-teacher';
}
