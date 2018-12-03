import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AddonSetup } from '@materia/addons';
import { IApp } from '@materia/interfaces';

import { AwsS3Config } from '../aws-s3-view/aws-s3-view.component';

@AddonSetup('@materia/aws-s3')
@Component({
  selector: 'materia-aws-s3-setup',
  templateUrl: './aws-s3-setup.component.html',
  styleUrls: ['./aws-s3-setup.component.scss']
})
export class AwsS3SetupComponent implements OnInit {
  @Input() app: IApp;
  @Input() baseUrl: string;

  @Output() save = new EventEmitter<AwsS3Config>();
  @Output() cancel = new EventEmitter<void>();

  config: AwsS3Config;
  awsConfigForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  ngOnInit() {
    this.getAwsConfig().then(() => {
      this.awsConfigForm = this.fb.group({
        accessKeyId: [this.config.accessKeyId, Validators.required],
        secretAccessKey: [this.config.secretAccessKey, Validators.required],
        region: [this.config.region, Validators.required]
      });
    });
  }

  submit() {
    if (this.awsConfigForm.valid) {
      this.save.emit(Object.assign({}, this.awsConfigForm.value, {endpoints: this.config.endpoints}));
    }
  }

  close() {
    this.cancel.emit();
  }

  private getAwsConfig() {
    return this.http.get(`${this.baseUrl}/addons/@materia/aws-s3/setup`).toPromise().then((setup: any) => {
        this.config = setup;
    });
  }
}
