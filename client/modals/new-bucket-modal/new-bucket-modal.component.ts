import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'materia-new-bucket-modal',
  templateUrl: './new-bucket-modal.component.html',
  styleUrls: ['./new-bucket-modal.component.scss']
})
export class NewBucketModalComponent implements OnInit {
  @Output() save = new EventEmitter<string>();
  @ViewChild('template') template: TemplateRef<any>;

  bucketForm: FormGroup;
  submitted: boolean;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.bucketForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  clearForm() {
    this.bucketForm.get('name').reset();
    this.submitted = false;
  }

  submit() {
    if (this.bucketForm.valid && ! this.submitted) {
      this.submitted = true;
      this.save.emit(this.bucketForm.get('name').value);
    }
  }
}
