import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { QueryService } from '../../services/query.service';
import { NewBucketModalComponent, ConfirmModalComponent } from '../../modals';

@Component({
  selector: 'materia-buckets',
  templateUrl: './buckets.component.html',
  styleUrls: ['./buckets.component.scss']
})
export class BucketsComponent implements OnInit {
  @Input() baseUrl: string;
  @Input() buckets: any[];
  @Input() loadingBuckets: boolean;
  @Input() firstLoad: boolean;

  @Output() download = new EventEmitter<string>();
  @Output() refreshBuckets = new EventEmitter<void>();
  @Output() snackbarError = new EventEmitter<string>();
  @Output() snackbarSuccess = new EventEmitter<string>();
  @Output() openInBrowser = new EventEmitter<string>();

  @ViewChild(NewBucketModalComponent) bucketModalComponent: NewBucketModalComponent;

  selectedBucket: any;
  awsS3EntityName = 'aws-s3-service';
  loadingBucketContent: boolean;
  bucketModalInstance: MatDialogRef<any>;

  confirmMessage: string;
  confirmMessageDetail: string;

  constructor(
    private queryService: QueryService,
    private dialog: MatDialog
  ) { }

  ngOnInit() { }

  addBucket(bucketName) {
    this.bucketModalInstance.close();
    this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'createBucket', { Bucket: bucketName }).then(() => {
      this.snackbarSuccess.emit(`Bucket '${bucketName}' successfully created`);
      this.unselectBucket();
      this.refreshBuckets.emit();
    }).catch(err => this.snackbarError.emit(err));

  }

  async deleteBucket(bucketName) {
    const confirmModalInstance = await this.dialog.open(ConfirmModalComponent);
    confirmModalInstance.componentInstance.message = `Are you sure you want to delete the bucket: "${bucketName}" ?`;
    confirmModalInstance.componentInstance.buttonNames = ['Cancel', 'Confirm'];
    const result = await confirmModalInstance.afterClosed().toPromise();
    if (result === 'confirm') {
      this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'deleteBucket', { Bucket: bucketName }).then(() => {
        this.unselectBucket();
        this.refreshBuckets.emit();
      }).catch(err => this.snackbarError.emit(err));
    }
  }

  async deleteBucketObject(objectKey) {
    const confirmModalInstance = await this.dialog.open(ConfirmModalComponent);
    confirmModalInstance.componentInstance.message = `Are you sure you want to delete your file: "${objectKey}" ?`;
    confirmModalInstance.componentInstance.buttonNames = ['Cancel', 'Confirm'];
    const result = await confirmModalInstance.afterClosed().toPromise();
    if (result === 'confirm') {
      this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'deleteBucketObject',
        { Bucket: this.selectedBucket.name, Key: objectKey })
        .then(() => {
          this.listBucketObjects(this.selectedBucket.name);
        }).catch(err => this.snackbarError.emit(err));
    }
  }

  openBucketObject(objectKey) {
    this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'getSignedUrl', { Bucket: this.selectedBucket.name, Key: objectKey })
      .then((result: { count: number, data: any[] }) => {
        const url = result.data[0].response;
        this.openInBrowser.emit(url);
      }).catch(err => this.snackbarError.emit(err));
  }

  listBucketObjects(bucket): Promise<any> {
    this.loadingBucketContent = true;
    if (!this.selectedBucket) {
      this.selectedBucket = Object.assign({});
    }
    this.selectedBucket.name = bucket;
    return this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'listBucketObjects', { Bucket: bucket })
      .then((result: any) => {
        this.selectedBucket = Object.assign({}, { name: bucket, data: result.data });
        this.loadingBucketContent = false;
        return this.selectedBucket;
      }).catch(err => {
        this.snackbarError.emit(err);
        return Promise.reject(err);
      });
  }

  openBucketModal() {
    this.bucketModalComponent.clearForm();
    this.bucketModalInstance = this.dialog.open(this.bucketModalComponent.template, {
      panelClass: 'no-padding',
      width: '300px',
      disableClose: true
    });
  }

  selectBucket(bucket) {
    this.listBucketObjects(bucket);
  }

  unselectBucket() {
    this.selectedBucket = null;
  }
}
