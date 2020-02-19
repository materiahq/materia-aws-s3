import { Component, OnInit, OnChanges, Input, ViewChild, EventEmitter, Output, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { IApp, IPermission, IEndpoint } from '@materia/interfaces';

import { AwsEndpointEditorComponent } from '../../modals';
import { AwsS3ViewComponent } from '../../aws-s3-view/aws-s3-view.component';

const path = {
  join: (...args) => {
    return args.join(
      window.navigator.platform.substr(0, 3) === 'Win' ? '\\' : '/'
    );
  }
};

export const ENDPOINT_TYPES_METHOD = {
  upload: 'post',
  fetch: 'get',
  delete: 'delete'
};

export const METHODS_COLOR = {
  get: '#C8E6C9',
  post: '#B3E5FC',
  put: '#FFCCBC',
  delete: '#FFCDD2',
  patch: '#D7CCC8'
};

@Component({
  selector: 'materia-aws-endpoints',
  templateUrl: './aws-endpoints.component.html',
  styleUrls: ['./aws-endpoints.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AwsEndpointsComponent implements OnInit, OnChanges {
  @Input() app: IApp;
  @Input() allEndpoints: IEndpoint[];
  @Input() awsEndpoints: any[];
  @Input() buckets: any[];
  @Input() apiUrl: string;
  @Input() baseUrl: string;
  @Input() permissions: IPermission[];

  @Output() saveEndpoints = new EventEmitter<any[]>();

  @ViewChild(AwsEndpointEditorComponent) endpointEditorComponent: AwsEndpointEditorComponent;

  selectedEndpoint: any;
  endpointEditorModalRef: MatDialogRef<TemplateRef<any>>;
  emptyMessage = `You haven't any endpoints yet.`;

  methodsColor: { [method: string]: string } = METHODS_COLOR;

  endpointTypesMethod = ENDPOINT_TYPES_METHOD;
  endpointBuckets: string[];
  bucketControllerCode: string;

  constructor(
    private dialog: MatDialog,
    private awsS3ViewComponent: AwsS3ViewComponent,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this._getUploadControllerCode();
  }

  ngOnChanges() {
    this.endpointBuckets = Array.from(new Set(this.awsEndpoints.map(e => e.bucket)));
  }

  async addEndpoint(newEndpoint) {
    await this.addEndpointInServer(newEndpoint);
    const endpoints = [...this.awsEndpoints];
    endpoints.push(newEndpoint);
    this._saveEndpoints(endpoints);
  }

  openEndpointEditor() {
    this.endpointEditorModalRef = this.dialog.open(this.endpointEditorComponent.template, {
      panelClass: ['no-padding', 'mat-dialog-content-no-padding'], width: '350px', maxHeight: '90%'
    });
  }

  closeEndpointEditor() {
    this.endpointEditorModalRef.close();
  }

  consctructNewEndpoint() {
    this.selectedEndpoint = null;
    this.openEndpointEditor();
  }

  async deleteEndpoint(endpoint) {
    const result = await this.awsS3ViewComponent.confirm(`Are your sure you want to delete endpoint: ${endpoint.url} ?`);
    if (result === 'confirm') {
      await this.deleteEndpointInServer(endpoint);
      const endpoints = [...this.awsEndpoints];
      const index = endpoints.findIndex(e => e.type + e.url === endpoint.type + endpoint.url);
      endpoints.splice(index, 1);
      this._saveEndpoints(endpoints);
    }
  }

  addEndpointInServer(endpoint) {
    let action;
    let method;
    if (endpoint.type === 'upload') {
      action = endpoint.upload_type && endpoint.upload_type === 'single' ? 'uploadSingle' : 'uploadMultiple';
      method = 'post';
    } else if (endpoint.type === 'fetch') {
      action = 'fetchObject';
      method = 'get';
    } else if (endpoint.type === 'delete') {
      action = 'deleteObject';
      method = 'delete';
    }
    return this.http.post(`${this.baseUrl}/endpoints`,
    {
      options: {save: false},
      endpoint: {
        url: endpoint.url,
        type: 'code',
        method: method,
        controller: 'bucket',
        action: action,
        fromAddon: {
          package: '@materia/aws-s3',
          path: path.join(this.app.path, 'node_modules', '@materia/aws-s3')
        },
        permissions: endpoint.permissions
      }
    }).toPromise();
  }

  deleteEndpointInServer(endpoint) {
    return this.http.delete(`${this.baseUrl}/endpoints/${btoa(this.endpointTypesMethod[endpoint.type] + endpoint.url)}`).toPromise();
  }

  editEndpoint() {
    this.openEndpointEditor();
  }

  saveEndpoint(newEndpoint) {
    this.closeEndpointEditor();
    if (this.selectedEndpoint) {
      this.updateEndpoint(newEndpoint);
    } else {
      this.addEndpoint(newEndpoint);
    }
  }

  selectEndpoint(endpoint) {
    this.selectedEndpoint = Object.assign({}, endpoint);
  }

  async updateEndpoint(endpoint) {
    const endpoints = [...this.awsEndpoints];
    const index = endpoints.findIndex(e => e.type + e.url === this.selectedEndpoint.type + this.selectedEndpoint.url);
    await this.deleteEndpointInServer(this.selectedEndpoint);
    await this.addEndpointInServer(endpoint);
    endpoints[index] = Object.assign({}, endpoint);
    this.selectedEndpoint = Object.assign({}, endpoint);
    this._saveEndpoints(endpoints);
  }

  private _saveEndpoints(endpoints) {
    this.saveEndpoints.emit(endpoints);
  }

  private _getUploadControllerCode() {
    return this.http.get(`${this.baseUrl}/controllers/@materia/aws-s3/bucket`, { responseType: 'text' })
    .toPromise().then((code: string) => {
      this.bucketControllerCode = code;
    });
  }
}
