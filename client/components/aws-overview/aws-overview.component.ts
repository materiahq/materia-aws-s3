import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'materia-aws-overview',
  templateUrl: './aws-overview.component.html',
  styleUrls: ['./aws-overview.component.scss']
})
export class AwsOverviewComponent implements OnInit {
  @Output() openInBrowser = new EventEmitter<string>();
  @Output() openSetup = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

}
