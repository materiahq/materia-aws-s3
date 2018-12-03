import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'materia-bucket-list',
  templateUrl: './bucket-list.component.html',
  styleUrls: ['./bucket-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketListComponent implements OnInit {
  @Input() buckets: any;
  @Input() selected: string;
  @Output() select = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  trackByName(index, item) {
    return item.Name;
  }

}
