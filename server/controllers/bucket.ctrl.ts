import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as md5 from 'md5';
import * as request from 'request';

import { App } from '@materia/server';

import { AwsServiceLib } from '../lib/aws-service.lib';

class BucketCtrl {
    awsServiceLib: AwsServiceLib;
    config: { [param_name: string]: any; };

    constructor(private app: App) {
        this.config = this.app.addons.addonsConfig['@materia/aws-s3'];
        this.awsServiceLib = new AwsServiceLib(this.app, this.config);
        this.awsServiceLib.loadConfig();
    }

    uploadMultiple(req, res) {
        return new Promise((resolve, reject) => {
            const config = this._getEndpointConfig(req);
            if (config.request_timeout) {
                req.setTimeout(config.request_timeout);
            }
            const upload = this._configureMulterS3(config);
            upload.array(config.input_name, config.max_file_count ? config.max_file_count : null)(req, res, err => {
                if (err) {
                    return reject(err);
                }
                const result = [];
                req.files.forEach(file => {
                    result.push({
                        key: file.key,
                        original_name: file.originalname,
                        from: req.url,
                        type: file.mimetype,
                        size: file.size
                    });
                });
                return resolve(result);
            });
        });
    }

    uploadSingle(req, res) {
        return new Promise((resolve, reject) => {
            const config = this._getEndpointConfig(req);
            if (config.request_timeout) {
                req.setTimeout(config.request_timeout);
            }
            const upload = this._configureMulterS3(config);
            upload.single(config.input_name)(req, res, err => {
                if (err) {
                    return reject(err);
                }
                const result = {
                    key: req.file.key,
                    original_name: req.file.originalname,
                    from: req.url,
                    type: req.file.mimetype,
                    size: req.file.size
                };
                resolve(result);
            });
        });
    }

    fetchObject(req, res) {
        const config = this._getEndpointConfig(req);
        const key = req.params.key ? req.params.key : req.query.key;
        return request(this.awsServiceLib.getBucketSignedUrl({Bucket: config.bucket, Key: key})).pipe(res);
    }

    deleteObject(req, res) {
        const config = this._getEndpointConfig(req);
        const key = req.params.key ? req.params.key : req.query.key;
        return this.awsServiceLib.deleteBucketObject({Bucket: config.bucket, Key: key});
    }

    private _configureMulterS3(config) {
        return multer({
            limits: {
                fileSize: config.size_limit ? config.size_limit : 10000000
            },
            fileFilter: (_req, file, cb) => {
                if (config.mime_types && config.mime_types.length) {
                    let match = false;
                    config.mime_types.forEach(type => {
                        if (file.mimetype === type) {
                            match = true;
                        }
                    });
                    if (match) {
                        cb(null, true);
                    } else {
                        return cb(`Only following ${config.mime_types} mime_types are allowed`);
                    }
                } else {
                    cb(null, true);
                }
            },
            storage: multerS3({
                s3: this.awsServiceLib.s3,
                bucket: config.bucket,
                contentType: multerS3.AUTO_CONTENT_TYPE,
                key: function (req, file, cb) {
                  cb(null, md5(Date.now().toString()));
                }
            })
        });
    }

    private _getEndpointConfig(req) {
        let config;
        let key;
        let url;
        const urlArray = req.url.split('/');
        if (req.params.key) {
            key = req.params.key;
            urlArray[urlArray.indexOf(key)] = ':key';
            url = urlArray.join('/');
        } else if (req.query.key) {
            key = req.query.key;
            url = urlArray.join('/').split('?')[0];
        } else {
            url = urlArray.join('/');
        }
        if (this.config && this.config.endpoints) {
            config = this.config.endpoints.find(e => e.url === url);
        }
        return config ? config : {};
    }
}

export = BucketCtrl;
