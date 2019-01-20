
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddonView } from '@materia/addons';
import { MatDialog } from '@angular/material';
import { IApp, IEndpoint, IPermission } from '@materia/interfaces';

import { ConfirmModalComponent } from '../modals';
import { QueryService } from '../services/query.service';

export interface SelectedBucket {
    name: string;
    data?: any[];
}
export interface AwsS3Config {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    endpoints?: IEndpoint[];
}

@AddonView('@materia/aws-s3')
@Component({
    selector: 'materia-aws-s3-uploader-view',
    templateUrl: './aws-s3-view.component.html',
    styleUrls: ['./aws-s3-view.component.scss'],
    providers: []
})
export class AwsS3ViewComponent implements OnInit {
    @Input() app: IApp;
    @Input() settings: AwsS3Config;
    @Input() baseUrl: string;
    @Input() apiUrl: string;

    @Output() refreshApi = new EventEmitter<void>();
    @Output() openSetup = new EventEmitter<void>();
    @Output() openInBrowser = new EventEmitter<string>();
    @Output() snackbarError = new EventEmitter<string>();
    @Output() snackbarSuccess = new EventEmitter<string>();

    @ViewChild(ConfirmModalComponent) confirmModalComponent: ConfirmModalComponent;

    buckets = [];

    confirmMessage: string;
    confirmMessageDetail: string;
    loadingBuckets: boolean;
    section = 'buckets';
    permissions: IPermission[];
    allEndpoints: IEndpoint[];
    loadingBucketsError: boolean;
    firstLoad = true;

    get hasSettings(): boolean {
        return this.settings && Object.keys(this.settings).length ? true : false;
    }

    get hasAwsConfig(): boolean {
        return this.hasSettings && this.settings.secretAccessKey && this.settings.region && this.settings.accessKeyId ? true : false;
    }

    constructor(private dialog: MatDialog, private http: HttpClient, private queryService: QueryService) { }

    ngOnInit() {
        if ( ! this.settings ) {
            this.settings = {};
        }
        if ( ! this.settings.endpoints ) {
            this.settings.endpoints = [];
        }
        this.initializeS3().then(() => {
            if (this.hasAwsConfig) {
                this.listBuckets();
                this.getMateriaPermissions();
                this.getMateriaEndpoints();
                this.getAwsEndpoints();
            }
        });
    }

    initializeS3() {
        return this.queryService.runQuery(this.baseUrl, 'aws-s3-service', 'reloadS3');
    }

    confirm(message: string, messageDetail?: string): Promise<string> {
        this.confirmMessage = message;
        if (messageDetail) {
            this.confirmMessageDetail = messageDetail;
        } else {
            this.confirmMessageDetail = null;
        }
        const dialogRef = this.dialog.open(this.confirmModalComponent.template);
        return dialogRef.afterClosed().toPromise();
    }

    saveEndpoints(endpoints) {
        this.settings = Object.assign({}, this.settings, { endpoints: [...endpoints] });
        this.saveSettings();
    }

    saveSettings() {
        return this.http.post(`${this.baseUrl}/addons/@materia/aws-s3/setup`, this.settings).toPromise().then(() => {
            this.refreshApi.emit();
            this.getMateriaEndpoints();
        });
    }

    listBuckets() {
        this.loadingBuckets = true;
        this.loadingBucketsError = false;
        return this.queryService.runQuery(this.baseUrl, 'aws-s3-service', 'list').then((result: any) => {
            this.buckets = [...result.data];
            this.firstLoad = false;
            this.loadingBuckets = false;
        }).catch(err => {
            this.loadingBuckets = false;
            this.loadingBucketsError = true;
            return this.snackbarError.emit(err);
        });
    }

    private getAwsEndpoints() {
        return this.http.get(`${this.baseUrl}/addons/@materia/aws-s3/setup`).toPromise().then((setup: any) => {
            this.settings = Object.assign(
                {},
                this.settings,
                { endpoints: setup && setup.endpoints && setup.endpoints.length ? [...setup.endpoints] : [] }
            );
        });
    }

    private getMateriaPermissions() {
        return this.http.get(`${this.baseUrl}/permissions`).toPromise().then((permissions: IPermission[]) => {
            this.permissions = permissions;
        });
    }

    private getMateriaEndpoints() {
        return this.http.get(`${this.baseUrl}/endpoints`).toPromise().then((endpoints: IEndpoint[]) => {
            this.allEndpoints = endpoints;
        });
    }
}
