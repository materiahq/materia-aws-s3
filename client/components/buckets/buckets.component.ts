import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { QueryService } from '../../services/query.service';
import { NewBucketModalComponent } from '../../modals';
import { AwsS3ViewComponent, SelectedBucket } from '../../aws-s3-view/aws-s3-view.component';

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

  @ViewChild(NewBucketModalComponent) bucketModalComponent: NewBucketModalComponent;

  selectedBucket: SelectedBucket;
  awsS3EntityName = 'aws-s3-service';
  loadingBucketContent: boolean;
  bucketModalInstance: MatDialogRef<any>;

  confirmMessage: string;
  confirmMessageDetail: string;

  constructor(
    private queryService: QueryService,
    private dialog: MatDialog,
    private awsS3ViewComponent: AwsS3ViewComponent
  ) { }

  ngOnInit() { }

  addBucket(bucketName) {
    this.bucketModalInstance.close();
    this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'createBucket', { Bucket: bucketName }).then(() => {
      this.awsS3ViewComponent.snackbarSuccess.emit(`Bucket '${bucketName}' successfully created`);
      this.unselectBucket();
      this.refreshBuckets.emit();
    }).catch(err => this.awsS3ViewComponent.snackbarError.emit(err));

  }

  async deleteBucket(bucketName) {
    const result = await this.awsS3ViewComponent.confirm(`Are you sure you want to delete the bucket: "${bucketName}" ?`);
    if (result === 'confirm') {
      this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'deleteBucket', { Bucket: bucketName }).then(() => {
        this.unselectBucket();
        this.refreshBuckets.emit();
      }).catch(err => this.awsS3ViewComponent.snackbarError.emit(err));
    }
  }

  async deleteBucketObject(objectKey) {
    const result = await this.awsS3ViewComponent.confirm(`Are you sure you want to delete your file: "${objectKey}" ?`);
    if (result === 'confirm') {
      this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'deleteBucketObject',
        { Bucket: this.selectedBucket.name, Key: objectKey })
        .then(() => {
          this.listBucketObjects(this.selectedBucket.name);
        }).catch(err => this.awsS3ViewComponent.snackbarError.emit(err));
    }
  }

  openBucketObject(objectKey) {
    this.queryService.runQuery(this.baseUrl, this.awsS3EntityName, 'getSignedUrl', { Bucket: this.selectedBucket.name, Key: objectKey })
      .then((result: { count: number, data: any[] }) => {
        const url = result.data[0].response;
        this.awsS3ViewComponent.openInBrowser.emit(url);
      }).catch(err => this.awsS3ViewComponent.snackbarError.emit(err));
  }

  listBucketObjects(bucket): Promise<SelectedBucket> {
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
        this.awsS3ViewComponent.snackbarError.emit(err);
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
