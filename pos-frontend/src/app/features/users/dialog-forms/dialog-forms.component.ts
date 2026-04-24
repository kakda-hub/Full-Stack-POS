import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-forms',
  standalone: false,
  templateUrl: './dialog-forms.component.html',
  styleUrl: './dialog-forms.component.scss',
})
export class DialogFormsComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
