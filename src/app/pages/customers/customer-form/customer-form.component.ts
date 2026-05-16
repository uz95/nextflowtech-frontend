import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customers = inject(CustomerService);
  private readonly notifications = inject(NotificationService);

  id = this.route.snapshot.paramMap.get('id');
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [''],
    phone: [''],
    address: [''],
    notes: ['']
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.customers.get(this.id).subscribe((customer) => this.form.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      notes: customer.notes ?? ''
    }));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request = this.form.getRawValue();
    const save$ = this.id ? this.customers.update(this.id, request) : this.customers.create(request);
    save$.subscribe(() => {
      this.notifications.success(this.id ? 'Customer updated.' : 'Customer created.');
      void this.router.navigateByUrl('/customers');
    });
  }
}