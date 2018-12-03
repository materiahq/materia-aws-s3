import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse, HttpRequest } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'materia-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit {
  @Input() type: string; // single or multiple
  @Input() url: string;
  @Input() input_name: string;
  @Output() uploadSucceed = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  selectedFiles: File[];
  uploading: boolean;
  uploadSuccessResponse: any;
  uploadFailResponse: string;
  progress: Observable<number>;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  fileChange(event) {
    if (event.target.files && event.target.files[0]) {
      if (this.type === 'single') {
        this.selectedFiles = [event.target.files[0]];
      } else {
        this.selectedFiles = [...event.target.files];
      }
      this.cd.detectChanges();
    }
  }

  upload() {
    if (this.selectedFiles) {
      const progress = new Subject<number>();
      this.progress = progress.asObservable();
      this.uploading = true;
      this.uploadFailResponse = null;
      this.uploadSuccessResponse = null;
      const data = new FormData();
      if (this.type === 'single') {
        data.append(this.input_name, this.selectedFiles[0]);
      } else {
        this.selectedFiles.forEach((file) => {
          data.append(this.input_name, file);
        });
      }
      const req = new HttpRequest('POST', this.url, data, {reportProgress: true});
      this.http.request(req).subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {

          // calculate the progress percentage
          const percentDone = Math.round(100 * event.loaded / event.total);

          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          this.uploadSucceed.emit();
          this.uploadSuccessResponse = event;
          this.uploading = false;
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          progress.complete();
        }
      }, (err) => {
        this.uploading = false;
        let errorMessage = '';
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else {
          errorMessage = err.error.code;
        }
        this.uploadFailResponse = errorMessage;
      });
    } else {
      this.snackBar.open('You should select a file first', 'Error');
    }
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    if ( ! this.selectedFiles.length) {
      this.selectedFiles = null;
    }
  }
  refresh() {
    this.selectedFiles = null;
    this.uploadFailResponse = null;
    this.uploadSuccessResponse = null;
  }

}
