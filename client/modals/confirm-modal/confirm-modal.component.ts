import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'materia-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent implements OnInit {
    @Input() message: string;
    @Input() messageDetail: string;
    @Input() buttonNames: Array<string>;

    constructor() { }

    ngOnInit() { }
}
