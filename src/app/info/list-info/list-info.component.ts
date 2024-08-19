import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { InfoComponent } from "../info/info.component";
import { countries } from '../countries';
import { SearchComponent } from "../search/search.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { CovidInfoService } from '../covid-info.service';
import { finalize, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CovidInfo } from '../models/covid-info.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Filter } from '../models/filter.model';
import { AuthService } from '../../user/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartComponent } from "../chart/chart.component";

@Component({
  selector: 'app-list-info',
  standalone: true,
  imports: [InfoComponent, SearchComponent, MatSidenavModule, MatTableModule, MatProgressSpinnerModule, ChartComponent],
  templateUrl: './list-info.component.html',
  styleUrl: './list-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInfoComponent {
  protected countries = signal<string[]>(countries.toSorted());  

  protected showSearch = signal(true);

  protected showCasesChart = signal(false);
  protected showVaccinationChart = signal(false);

  private readonly ACTIVE_FILTER_KEY = 'active-filter';

  displayedColumns = signal<string[]>([]);

  dataSource = signal<CovidInfo[]>([]);

  isLoading = signal(false);  

  constructor(
    private readonly covidInfoService: CovidInfoService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly destroyRef: DestroyRef,
  ) { 

    const filter = sessionStorage.getItem(this.ACTIVE_FILTER_KEY);
    if(filter) {           
      this.refreshData(JSON.parse(filter))
    }
  }  
  
  refreshData(filter: Filter) {
    console.log('refreshData:', JSON.stringify(filter));    
    this.isLoading.set(true);
    
    // Unregistered users limited for 3 searches maximum
    if(this.authService.isLoggedIn || this.authService.guestSearchAllowed) {
      this.authService.consumeSearchAttempt();
    } else {
      this.snackBar.open('Please log in or register for further searches', 'OK', {duration: 5000});
      this.router.navigate(['/register']);
    }

    sessionStorage.setItem(this.ACTIVE_FILTER_KEY, JSON.stringify(filter));    
    
    // Set displayed columns
    this.displayedColumns.set([
      'country'
    ]);
    if(filter.showCases) {
      this.displayedColumns.set([
        ...this.displayedColumns(),
        'confirmed', 
        'deaths', 
        'recovered'
      ]);
    }
    if(filter.showVaccination) {
      this.displayedColumns.set([
        ...this.displayedColumns(),
        'administered',
        'people_vaccinated'
      ]);
    }    

    

    // Retrieve data
    // TODO: move to separate datasource object
    let dataSet: CovidInfo[] = [];
    this.covidInfoService.getCasesMultiple(filter.countries).pipe(
      tap(res => dataSet = res),
      switchMap(() => this.covidInfoService.getVaccinationMultiple(filter.countries)),      
      switchMap(vaccarr => {
        vaccarr.forEach(vacc => {
          dataSet.forEach((d, ix) => {
            if(vacc.country === d.country) {              
              dataSet[ix] = {                 // Merge case and vaccination data
                ...d,
                ...vacc
              }            
            }
          });
        })
        return of(dataSet);
      }),      
      tap(this.dataSource.set),
      tap(() => {
          this.showCasesChart.set(filter.showCharts && filter.showCases);
          this.showVaccinationChart.set(filter.showCharts && filter.showVaccination);
        }),
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }  
}
