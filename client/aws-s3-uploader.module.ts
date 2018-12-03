import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addon } from '@materia/addons';

import { AwsS3ViewComponent } from './aws-s3-view/aws-s3-view.component';
import { SharedModule } from './shared/shared.module';

import { BucketsComponent } from './components/buckets/buckets.component';
import { BucketListComponent } from './components/buckets/bucket-list/bucket-list.component';
import { BucketObjectListComponent } from './components/buckets/bucket-object-list/bucket-object-list.component';

import { EmptyMessageComponent } from './components/empty-message/empty-message.component';

import { NewBucketModalComponent, ConfirmModalComponent, AwsEndpointEditorComponent } from './modals';

import { BytePipe } from './pipes/byte.pipe';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { AwsEndpointsComponent } from './components/aws-endpoints/aws-endpoints.component';
import { AwsOverviewComponent } from './components/aws-overview/aws-overview.component';
import { EndpointsFilterPipe } from './pipes/endpoints-filter.pipe';
import { EndpointsSortPipe } from './pipes/endpoints-sort';
import { AwsS3SetupComponent } from './aws-s3-setup/aws-s3-setup.component';

@Addon('@materia/aws-s3')
@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    AwsS3ViewComponent,
    BucketListComponent,
    EmptyMessageComponent,
    BucketObjectListComponent,
    NewBucketModalComponent,
    ConfirmModalComponent,
    BytePipe,
    BucketsComponent,
    UploadFormComponent,
    AwsEndpointsComponent,
    AwsEndpointEditorComponent,
    AwsOverviewComponent,
    EndpointsFilterPipe,
    EndpointsSortPipe,
    AwsS3SetupComponent
  ],
  exports: [
    AwsS3ViewComponent,
    AwsS3SetupComponent
  ]
})
export class AwsS3Module {}
