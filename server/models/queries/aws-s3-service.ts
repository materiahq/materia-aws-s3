import * as md5 from 'md5';
import { App } from '@materia/server';
import {
    ListBucketsOutput,
    CreateBucketOutput,
    ListObjectsOutput,
    Buckets,
    ObjectList,
    GetObjectOutput,
    PutObjectOutput
} from 'aws-sdk/clients/s3';

import { AwsServiceLib, AwsS3ServiceConfig } from '../../lib/aws-service.lib';

class AwsS3Service {
    config: AwsS3ServiceConfig;
    awsServiceLib: AwsServiceLib;

    constructor(private app: App) {
        this.config = (this.app.addons.addonsConfig['@materia/aws-s3'] as AwsS3ServiceConfig);
        this.awsServiceLib = new AwsServiceLib(this.app, this.config);
        this.awsServiceLib.loadConfig();
    }

    createBucket(params): Promise<CreateBucketOutput> {
        return this.awsServiceLib.createBucket(params);
    }

    deleteBucket(params) {
        return this.awsServiceLib.deleteBucket(params);
    }

    deleteBucketObject(params) {
        return this.awsServiceLib.deleteBucketObject(params);
    }

    deleteBucketObjects(params) {
        return this.awsServiceLib.deleteBucketObjects(params);
    }

    getBucketObject(params): Promise<GetObjectOutput> {
        return this.awsServiceLib.getBucketObject(params);
    }

    getSignedUrl(params): string {
        return this.awsServiceLib.getBucketSignedUrl(params);
    }

    listBuckets(): Promise<Buckets> {
        return this.awsServiceLib.listBuckets().then((result: ListBucketsOutput) => result.Buckets);
    }

    listBucketObjects(params): Promise<ObjectList> {
        return this.awsServiceLib.listBucketObjects(params).then((result: ListObjectsOutput) => result.Contents);
    }

    uploadToBucket(params: {Bucket: string, Body: any}): Promise<{Key: string}> {
        const key = md5(Date.now().toString());
        return this.awsServiceLib.uploadToBucket(Object.assign(params, {Key: key}));
    }

    uploadToBucketFromFilePath(params): Promise<{Key: string}> {
        return this.awsServiceLib.uploadToBucketFromFilePath(params);
    }
}

export = AwsS3Service;
