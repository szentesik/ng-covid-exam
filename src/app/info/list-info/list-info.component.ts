import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { InfoComponent } from "../info/info.component";
import { countries } from '../countries';
import { SearchComponent } from "../search/search.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { CovidInfoService } from '../covid-info.service';
import { delay, finalize, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CovidInfo } from '../models/covid-info.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-list-info',
  standalone: true,
  imports: [InfoComponent, SearchComponent, MatSidenavModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './list-info.component.html',
  styleUrl: './list-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInfoComponent {
  protected countries = signal<string[]>(countries.toSorted());  

  protected showSearch = signal(true);

  displayedColumns: string[] = ['country', 'confirmed', 'deaths', 'recovered', 'administered', 'people_vaccinated'];

  dataSource = signal<CovidInfo[]>([]);

  isLoading = signal(false);

  constructor(
    private readonly covidInfoService: CovidInfoService,
    private readonly destroyRef: DestroyRef
  ) {
    this.refreshData();    
  }

  refreshData() {
    this.isLoading.set(true);
    let dataSet: CovidInfo[] = [];
    this.covidInfoService.getCasesMultiple(this.countries()).pipe(
      tap(res => dataSet = res),
      switchMap(() => this.covidInfoService.getVaccinationMultiple(this.countries())),      
      switchMap(vaccarr => {
        vaccarr.forEach(vacc => {
          dataSet.forEach((d, ix) => {
            if(vacc.country === d.country) {              
              dataSet[ix] = {
                ...d,
                ...vacc
              }            
            }
          });
        })
        return of(dataSet);
      }),      
      tap(this.dataSource.set),      
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }  

}
