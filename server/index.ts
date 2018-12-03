import { AwsServiceLib, AwsS3ServiceConfig } from './lib/aws-service.lib';
import { App } from '@materia/server';

export default class AwsS3 {
    public static displayName = 'AWS S3';
    public static logo = 'https://raw.githubusercontent.com/materiahq/materia-website-content/master/logo/addons/amazon-s3.png';
    private awsUploader: AwsServiceLib;

    constructor(private app: App, private config: AwsS3ServiceConfig) {
        this.awsUploader = new AwsServiceLib(this.app, this.config);
    }

    start() {
        this.awsUploader.loadConfig();
    }

    afterLoadAPI() {
        if (this.config && this.config.endpoints && this.config.endpoints.length) {
            this.registerAwsEndpoints();
        }
    }

    private registerAwsEndpoints() {
        this.cleanAwsEndpoints();
        const awsS3Addon = this.app.addons.get('@materia/aws-s3');
        this.config.endpoints.forEach((endpoint) => {
            if ( ! endpoint.type) {
                endpoint.type = 'upload';
            }
            if (endpoint.type === 'upload') {
                if ( ! endpoint.upload_type) {
                    endpoint.upload_type = 'single';
                }
                this.app.api.add({
                    method: 'post',
                    url: endpoint.url,
                    controller: 'bucket',
                    action: endpoint.upload_type && endpoint.upload_type === 'single' ? 'uploadSingle' : 'uploadMultiple',
                    permissions: endpoint.permissions ? endpoint.permissions : [],
                    fromAddon: awsS3Addon
                }, { save: false });
            } else if (endpoint.type === 'fetch') {
                this.app.api.add({
                    method: 'get',
                    url: endpoint.url,
                    controller: 'bucket',
                    action: 'fetchObject',
                    permissions: endpoint.permissions ? endpoint.permissions : [],
                    fromAddon: awsS3Addon,
                    params: [
                        {
                            name: 'key',
                            required: true,
                            component: 'input',
                            type: 'text'
                        }
                    ]
                }, { save: false });
            } else if (endpoint.type === 'delete') {
                this.app.api.add({
                    method: 'delete',
                    url: endpoint.url,
                    controller: 'bucket',
                    action: 'deleteObject',
                    permissions: endpoint.permissions ? endpoint.permissions : [],
                    fromAddon: awsS3Addon,
                    params: [
                        {
                            name: 'key',
                            required: true,
                            component: 'input',
                            type: 'text'
                        }
                    ]
                }, { save: false });
            }
        });
    }

    private cleanAwsEndpoints() {
        const endpoints = this.app.api.findAll().map(api => {
            return Object.assign({}, api.toJson(), {
                fromAddon: api.fromAddon
                    ? {
                        name: api.fromAddon.name,
                        logo: api.fromAddon.logo,
                        package: api.fromAddon.package,
                        path: api.fromAddon.path
                    }
                    : {},
                params: api.getAllParams(),
                data: api.getAllData()
            });
        });
        if (endpoints && endpoints.length) {
            const awsEndpoints = endpoints.filter(api => api.fromAddon && api.fromAddon.package === '@materia/aws-s3');
            if (awsEndpoints && awsEndpoints.length) {
                awsEndpoints.forEach(e => {
                    this.app.api.remove(e.method, e.url, {save: false});
                });
            }
        }
    }
}
