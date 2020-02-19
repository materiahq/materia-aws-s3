import { Component, OnChanges, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'materia-bucket-object-list',
  templateUrl: './bucket-object-list.component.html',
  styleUrls: ['./bucket-object-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '50px'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class BucketObjectListComponent implements OnChanges {
  @Input() data: any[];
  @Input() loading: boolean;
  @Output() openInBrowser = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['Key', 'Size', 'LastModified'];
  dataSource: MatTableDataSource<any>;
  setPaginatorTimeout: any;
  expandedElement: any;

  constructor() { }

  ngOnChanges(changes) {
    if (changes.data && changes.data.currentValue && changes.data.currentValue.length) {
      this.dataSource = new MatTableDataSource<any>(changes.data.currentValue);
    } else if (changes.data && (! changes.data.currentValue || ! changes.data.currentValue.length)) {
      this.dataSource = null;
    }
    if (changes.loading && changes.loading.previousValue && ! changes.loading.currentValue && this.dataSource) {
      if (this.setPaginatorTimeout) {
        clearTimeout(this.setPaginatorTimeout);
        this.setPaginatorTimeout = null;
      }
      if (! this.sort && ! this.paginator) {
        this.setPaginatorTimeout = setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
       }, 0);
      } else {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }

  }

  selectRow(row) {
    if (! this.expandedElement || this.expandedElement !== row) {
      this.expandedElement = row;
    } else {
      this.expandedElement = null;
    }
  }

}
