import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addon } from '@materia/addons';

import { SharedModule } from './shared/shared.module';
import { AwsS3ViewComponent } from './aws-s3-view/aws-s3-view.component';
import { AwsS3SetupComponent } from './aws-s3-setup/aws-s3-setup.component';

import {
  BucketsComponent,
  BucketListComponent,
  BucketObjectListComponent,
  EmptyMessageComponent,
  UploadFormComponent,
  AwsEndpointsComponent,
  AwsOverviewComponent
} from './components';

import {
  NewBucketModalComponent,
  ConfirmModalComponent,
  AwsEndpointEditorComponent
} from './modals';

import { BytePipe } from './pipes/byte.pipe';
import { EndpointsFilterPipe } from './pipes/endpoints-filter.pipe';
import { EndpointsSortPipe } from './pipes/endpoints-sort';

@Addon('@materia/aws-s3')
@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    AwsS3ViewComponent,
    AwsS3SetupComponent,
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
    EndpointsSortPipe
  ],
  exports: [AwsS3ViewComponent, AwsS3SetupComponent]
})
export class AwsS3Module {}
