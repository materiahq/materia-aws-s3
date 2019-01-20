import * as md5 from 'md5';
import { join } from 'path';
import { createReadStream } from 'fs';
import { S3 } from 'aws-sdk';
import {
  ListBucketsOutput,
  ListObjectsOutput,
  CreateBucketOutput,
  ListObjectsRequest,
  PutObjectRequest,
  DeleteObjectRequest,
  CreateBucketRequest,
  GetObjectOutput,
  GetObjectRequest,
  DeleteBucketRequest
} from 'aws-sdk/clients/s3';
import { App } from '@materia/server';

export interface AwsS3ServiceConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  endpoints?: any[];
}

export class AwsServiceLib {
  static s3: S3;
  static loaded: boolean;
  static launchedConfig: AwsS3ServiceConfig;
  config: AwsS3ServiceConfig;

  constructor(private app: App) {
    this.initialize();
  }

  getAwsConfig() {
    this.config = (this.app.addons.addonsConfig['@materia/aws-s3'] as AwsS3ServiceConfig);
  }

  initialize(): void {
    this.getAwsConfig();
    if (this.config && this.config.region && this.config.accessKeyId && this.config.secretAccessKey) {
      if ( ! AwsServiceLib.loaded || (AwsServiceLib.loaded && this.settingsHasChange())) {
        if (AwsServiceLib.loaded) {
          AwsServiceLib.s3 = null;
        }
        AwsServiceLib.s3 = new S3({
          signatureVersion: 'v4',
          credentials: { accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey },
          region: this.config.region
        });
        AwsServiceLib.loaded = true;
        AwsServiceLib.launchedConfig = {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
          region: this.config.region
        };
      }
    } else {
      if (AwsServiceLib.loaded) {
        AwsServiceLib.s3 = null;
      }
      AwsServiceLib.loaded = false;
      throw new Error('AWS config not found');
    }
  }

  settingsHasChange(): boolean {
    return AwsServiceLib.launchedConfig.accessKeyId !== this.config.accessKeyId
      || AwsServiceLib.launchedConfig.secretAccessKey !== this.config.secretAccessKey
      || AwsServiceLib.launchedConfig.region !== this.config.region;
  }

  createBucket(params: CreateBucketRequest): Promise<CreateBucketOutput> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.createBucket(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucket(params: DeleteBucketRequest): Promise<any> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.deleteBucket(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucketObject(params: DeleteObjectRequest): Promise<any> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.deleteObject(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucketObjects(params: {Keys: string[], Bucket: string}): Promise<any> {
    if (AwsServiceLib.loaded) {
      const data = params.Keys.map((key) => ({ Key: key }));
      return AwsServiceLib.s3.deleteObjects({
        Delete: { Objects: data, Quiet: true },
        Bucket: params.Bucket
      }).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  getBucketObject(params: GetObjectRequest): Promise<GetObjectOutput> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.getObject(params).promise();
    } else {
      throw new Error('AWS config not found');
    }
  }

  getBucketSignedUrl(params: { Bucket: string, Key: string }): string {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.getSignedUrl('getObject', params);
    } else {
      throw new Error('AWS config not found');
    }
  }

  listBuckets(): Promise<ListBucketsOutput> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.listBuckets().promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  listBucketObjects(params: ListObjectsRequest): Promise<ListObjectsOutput> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.listObjects(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  uploadToBucket(params: PutObjectRequest): Promise<{Key: string}> {
    if (AwsServiceLib.loaded) {
      return AwsServiceLib.s3.putObject(params).promise().then(() => ({Key: params.Key}));
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  uploadToBucketFromFilePath(params): Promise<{Key: string}> {
    const path = this.getFullPath(params.path);
    const readStream = createReadStream(
      path
    );
    const key = md5(Date.now().toString());
    return this.uploadToBucket({Bucket: params.Bucket, Key: key, Body: readStream}).then(() => ({Key: key}));
  }

  private getFullPath(relativePath) {
    let p = this.app.path;
    if (relativePath && relativePath !== '/') {
      if (relativePath.includes(this.app.path)) {
        p = relativePath;
      } else {
        p = join(this.app.path, relativePath);
      }
    }
    return p;
  }
}
