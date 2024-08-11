import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CaseInfo } from '../models/cases.model';
import { VaccinationInfo } from '../models/vaccination.model';
import { CovidInfoService } from '../covid-info.service';
import { catchError, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [DatePipe, MatCardModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent implements OnInit {
  @Input({required: true}) country?: string;  

  protected cases = signal<CaseInfo | undefined>(undefined);
  protected vaccination = signal<VaccinationInfo | undefined>(undefined);

  constructor(
    private readonly covidInfoService: CovidInfoService,
    private readonly destroyRef: DestroyRef
  ) { }
  
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.covidInfoService.getCases(this.country!).pipe(
      tap(cases => this.cases.set(cases)),
      catchError(e => {        
        throw e;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.covidInfoService.getVaccination(this.country!).pipe(
      tap(vacc => this.vaccination.set(vacc)),
      catchError(e => {        
        throw e;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
