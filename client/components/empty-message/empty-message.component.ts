import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'materia-empty-message',
  templateUrl: './empty-message.component.html',
  styleUrls: ['./empty-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyMessageComponent implements OnInit {
  @Input() message: string;

  constructor() { }

  ngOnInit() {
  }

}
