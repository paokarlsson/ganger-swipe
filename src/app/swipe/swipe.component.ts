import { Component, OnInit } from '@angular/core';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-swipe',
  standalone: true,
  imports: [CdkDrag, CommonModule],
  templateUrl: './swipe.component.html',
  styleUrl: './swipe.component.scss',
})
export class SwipeComponent implements OnInit {
  ngOnInit(): void {
    this.topCard = this.cards.pop();
  }
  dragPosition = { x: 0, y: 0 };
  swipeLeft:string[] = []
  swipeRight:string[] = []
  
  topCard: string | undefined = '';
  cards: string[] = ['Tredje översta kortet', 'Näst översta kortet','Översta']
  
  dragTransform: any;
  dragMoved($event: CdkDragMove) {
    const x = $event.pointerPosition.x; // Current x position of the pointer
    const offsetX = x - window.innerWidth / 2; // Distance from center of the screen
    const rotation = offsetX / 20;
    const translateX = $event.distance.x;
    const translateY = $event.distance.y;

    this.dragTransform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;

  }
  dragEnd($event: CdkDragEnd<any>) {
      if($event.distance.x > 100) {
        if(this.topCard != null && this.topCard != undefined) {
          this.swipeRight.push(this.topCard)
          this.topCard = this.cards.pop();
          console.log(this.swipeRight)
        }
      } else if ($event.distance.x < -100) {
        if(this.topCard != null && this.topCard != undefined) {
          this.swipeLeft.push(this.topCard)
          this.topCard = this.cards.pop();
          console.log(this.swipeLeft)
        }
      }
      this.dragTransform = '';
  }
}
