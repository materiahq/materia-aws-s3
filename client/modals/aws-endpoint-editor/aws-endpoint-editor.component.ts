import {
  Component,
  ViewChild,
  TemplateRef,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { IEndpoint, IPermission } from '@materia/interfaces';

import { MIMETypes } from '../../components/aws-endpoints/mime-types.list';

@Component({
  selector: 'materia-aws-endpoint-editor',
  templateUrl: './aws-endpoint-editor.component.html',
  styleUrls: ['./aws-endpoint-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AwsEndpointEditorComponent implements OnInit, OnChanges {
  @Input() allEndpoints: IEndpoint[];
  @Input() awsEndpoints: any[];
  @Input() endpoint: any;
  @Input() permissions: IPermission[];
  @Input() buckets: any[];

  @Output() submit = new EventEmitter<any>();

  @ViewChild('endpointEditor') template: TemplateRef<any>;
  @ViewChild('uploadFormTemplate') uploadFormTemplate: TemplateRef<any>;
  @ViewChild('fetchFormTemplate') fetchFormTemplate: TemplateRef<any>;
  @ViewChild('deleteFormTemplate') deleteFormTemplate: TemplateRef<any>;
  @ViewChild('mimeTypes') mimeTypesInput: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  advanceSettingsExpanded: boolean;
  uploadForm: FormGroup;
  fetchForm: FormGroup;
  deleteForm: FormGroup;
  mimeTypesControl: FormControl;
  mimeTypesAllowed: string[];
  allMimeTypes: string[];
  filteredMimeTypes: Observable<string[]>;
  endpointTypes: {[type: string]: {template: TemplateRef<any>, method: string}};
  selectedEndpointType: any;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initEndpointForm();
    this.allMimeTypes = MIMETypes;
    this.mimeTypesControl = new FormControl(null);
    this.filteredMimeTypes = this.mimeTypesControl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value ? this._filter(value) : this.allMimeTypes.slice()));
    this.selectedEndpointType = 'upload';
    this.endpointTypes = {
      upload: {
        template: this.uploadFormTemplate,
        method: 'post'
      },
      fetch: {
        template: this.fetchFormTemplate,
        method: 'get'
      },
      delete: {
        template: this.deleteFormTemplate,
        method: 'delete'
      }
    };
  }

  ngOnChanges(changes) {
    if (changes.endpoint && changes.endpoint.currentValue && this.uploadForm) {
      this.selectedEndpointType = changes.endpoint.currentValue.type || 'upload';
      this.resetForm();
      this.updateFormWithValue(changes.endpoint.currentValue);
    } else if (changes.endpoint && ! changes.endpoint.firstChange && this.uploadForm) {
      this.resetForm();
      this.selectedEndpointType = 'upload';
    }
  }

  addAllowedMimeType(type) {
    if (type.value && type.value.length > 5 && this.mimeTypesAllowed.indexOf(type.value) === -1) {
      this.mimeTypesAllowed.push(type.value);
    }
    if (type.input) {
      type.input.value = '';
    }
    this.mimeTypesControl.setValue(null);
  }

  endpointTypeChange(event: MatButtonToggleChange) {
    this.selectedEndpointType = event.value;
  }

  getSelectedTemplate(type) {
    switch (type) {
      case 'upload':
        return this.uploadFormTemplate;
      case 'fetch':
        return this.fetchFormTemplate;
      case 'delete':
        return this.deleteFormTemplate;
      default:
        return this.uploadFormTemplate;
    }
  }

  saveUploadEndpoint() {
    if (this.uploadForm.valid) {
      const newEndpoint = this.uploadForm.value;
      newEndpoint.url = `/${newEndpoint.url}`;
      if (newEndpoint.upload_type === 'single') {
        delete newEndpoint.max_file_count;
      }
      if (newEndpoint.request_timeout <= 120000) {
        delete newEndpoint.request_timeout;
      }
      this.submit.emit(Object.assign({}, newEndpoint, {type: this.selectedEndpointType, mime_types: this.mimeTypesAllowed}));
    }
  }

  saveFetchEndpoint() {
    if (this.fetchForm.valid) {
      const newEndpoint = this.fetchForm.value;
      newEndpoint.url = `/${newEndpoint.url}`;
      this.submit.emit(Object.assign({}, newEndpoint, {type: this.selectedEndpointType}));
    }
  }

  saveDeleteEndpoint() {
    if (this.deleteForm.valid) {
      const newEndpoint = this.deleteForm.value;
      newEndpoint.url = `/${newEndpoint.url}`;
      this.submit.emit(Object.assign({}, newEndpoint, {type: this.selectedEndpointType}));
    }
  }

  selectMimeType(event: MatAutocompleteSelectedEvent): void {
    if (this.mimeTypesAllowed.indexOf(event.option.viewValue) === -1) {
      this.mimeTypesAllowed.push(event.option.viewValue);
      this.mimeTypesControl.setValue(null);
      this.mimeTypesInput.nativeElement.value = '';
    }
  }

  removeAllowedMimeType(type) {
    const index = this.mimeTypesAllowed.findIndex(t => t === type.value);
    this.mimeTypesAllowed.splice(index, 1);
  }

  resetForm() {
    this.uploadForm.reset();
    this.fetchForm.reset();
    this.deleteForm.reset();
    this.uploadForm.patchValue({
      upload_type: 'single',
      input_name: 'file',
      size_limit: 10000000,
      permissions: ['Anyone'],
      fetch_uploaded_file_permissions: ['Anyone'],
      request_timeout: 120000,
      bucket: this.buckets[0].Name
    });
    this.fetchForm.patchValue({
      permissions: ['Anyone'],
      bucket: this.buckets[0].Name
    });
    this.deleteForm.patchValue({
      permissions: ['Anyone'],
      bucket: this.buckets[0].Name
    });
  }

  uploadUrlValidator(control: FormControl) {
    if (this.awsEndpoints) {
      const url = control.value;
      const existingUrl = this.allEndpoints.map(e => e.method + e.url);
      if (
        existingUrl.indexOf(`post/${url}`) !== -1 &&
        (! this.endpoint || `post/${url}` !== `${this.endpointTypes[this.endpoint.type].method}${this.endpoint.url}`)
        ) {
        return {
          exists: true
        };
      }
    }
    return null;
  }

  fetchUrlValidator(control: FormControl) {
    const url = control.value;
    const existingUrl = this.allEndpoints.map(e => e.method + e.url);
    if (
      existingUrl.indexOf(`get/${url}`) !== -1 &&
      (! this.endpoint || `get/${url}` !== `${this.endpointTypes[this.endpoint.type].method}${this.endpoint.url}`)
      ) {
      return {
        exists: true
      };
    }
    return null;
  }

  deleteUrlValidator(control: FormControl) {
    const url = control.value;
    const existingUrl = this.allEndpoints.map(e => e.method + e.url);
    if (
      existingUrl.indexOf(`delete/${url}`) !== -1 &&
      (! this.endpoint || `delete/${url}` !== `${this.endpointTypes[this.endpoint.type].method}${this.endpoint.url}`)
      ) {
      return {
        exists: true
      };
    }
    return null;
  }

  private initEndpointForm() {
    this.mimeTypesAllowed = [];
    this.uploadForm = this.fb.group({
      upload_type: ['single', Validators.required],
      url: ['', [Validators.required, this.uploadUrlValidator.bind(this)]],
      bucket: [this.buckets[0].Name, Validators.required],
      input_name: ['file', Validators.required],
      size_limit: [10000000, Validators.required],
      permissions: [['Anyone']],
      max_file_count: null,
      request_timeout: 120000,
    });
    this.fetchForm = this.fb.group({
      url: ['', [Validators.required, this.fetchUrlValidator.bind(this)]],
      bucket: ['', Validators.required],
      permissions: [['Anyone']]
    });
    this.deleteForm = this.fb.group({
      url: ['', [Validators.required, this.deleteUrlValidator.bind(this)]],
      bucket: ['', Validators.required],
      permissions: [['Anyone']]
    });
  }

  private updateFormWithValue(endpoint) {
    if (endpoint.type === 'upload') {
      this.mimeTypesAllowed = endpoint.mime_types ? [...endpoint.mime_types] : [];
      this.uploadForm.patchValue({
        upload_type: endpoint.upload_type ? endpoint.upload_type : 'single',
        url: endpoint.url.substr(1),
        bucket: endpoint.bucket,
        input_name: endpoint.input_name,
        size_limit: endpoint.size_limit,
        permissions: endpoint.permissions,
        max_file_count: endpoint.max_file_count ? endpoint.max_file_count : null,
        request_timeout: endpoint.request_timeout ? endpoint.request_timeout : 120000
      });
    } else if (endpoint.type === 'fetch') {
      this.fetchForm.patchValue({
        url: endpoint.url.substr(1),
        bucket: endpoint.bucket,
        permissions: endpoint.permissions
      });
    } if (endpoint.type === 'delete') {
      this.deleteForm.patchValue({
        url: endpoint.url.substr(1),
        bucket: endpoint.bucket,
        permissions: endpoint.permissions
      });
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allMimeTypes.filter(mimeType => mimeType.toLowerCase().indexOf(filterValue) === 0);
  }
}
