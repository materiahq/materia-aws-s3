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
  PutObjectOutput,
  DeleteObjectRequest,
  CreateBucketRequest,
  GetObjectOutput,
  GetObjectRequest,
  DeleteBucketRequest,
  DeleteObjectsRequest
} from 'aws-sdk/clients/s3';
import { App } from '@materia/server';

export interface AwsS3ServiceConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  endpoints?: any[];
}

export class AwsServiceLib {
  s3: S3;
  loaded: boolean;

  constructor(private app: App, private config: AwsS3ServiceConfig) { }

  createBucket(params: CreateBucketRequest): Promise<CreateBucketOutput> {
    if (this.loaded) {
      return this.s3.createBucket(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucket(params: DeleteBucketRequest): Promise<any> {
    if (this.loaded) {
      return this.s3.deleteBucket(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucketObject(params: DeleteObjectRequest): Promise<any> {
    if (this.loaded) {
      return this.s3.deleteObject(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  deleteBucketObjects(params: {Keys: string[], Bucket: string}): Promise<any> {
    if (this.loaded) {
      const data = params.Keys.map((key) => ({ Key: key }));
      return this.s3.deleteObjects({
        Delete: { Objects: data, Quiet: true },
        Bucket: params.Bucket
      }).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  getBucketObject(params: GetObjectRequest): Promise<GetObjectOutput> {
    if (this.loaded) {
      return this.s3.getObject(params).promise();
    } else {
      throw new Error('AWS config not found');
    }
  }

  getBucketSignedUrl(params: { Bucket: string, Key: string }): string {
    if (this.loaded) {
      return this.s3.getSignedUrl('getObject', params);
    } else {
      throw new Error('AWS config not found');
    }
  }

  listBuckets(): Promise<ListBucketsOutput> {
    if (this.loaded) {
      return this.s3.listBuckets().promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  listBucketObjects(params: ListObjectsRequest): Promise<ListObjectsOutput> {
    if (this.loaded) {
      return this.s3.listObjects(params).promise();
    } else {
      return Promise.reject('AWS config not found');
    }
  }

  loadConfig(): void {
    if (this.config && this.config.region && this.config.accessKeyId && this.config.secretAccessKey) {
      this.loaded = true;
      this.s3 = new S3({
        signatureVersion: 'v4',
        credentials: { accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey },
        region: this.config.region
      });
    } else {
      throw new Error('AWS config not found');
    }
  }

  uploadToBucket(params: PutObjectRequest): Promise<{Key: string}> {
    if (this.loaded) {
      return this.s3.putObject(params).promise().then(() => ({Key: params.Key}));
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
