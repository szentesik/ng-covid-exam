import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, signal, ViewChild } from '@angular/core';
import { countries } from '../countries';
import { SearchComponent } from "../search/search.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-list-info',
  standalone: true,
  imports: [SearchComponent, MatSidenavModule, MatTableModule, 
    MatProgressSpinnerModule, MatSortModule, ChartComponent],
  templateUrl: './list-info.component.html',
  styleUrl: './list-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInfoComponent implements AfterViewInit {
 
  protected countries = signal<string[]>(countries.toSorted());  

  protected showSearch = signal(true);

  protected showCasesChart = signal(false);
  protected showVaccinationChart = signal(false);

  private readonly ACTIVE_FILTER_KEY = 'active-filter';

  displayedColumns = signal<string[]>([]);
  selectedCountries = signal<string[]>(this.countries());

  data = signal<CovidInfo[]>([]);
  dataSource = new MatTableDataSource(this.data());

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
      const activeFilter: Filter = JSON.parse(filter);
      this.selectedCountries.set(activeFilter.countries);
      this.refreshData(activeFilter);      
    }
  }    
  
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
      tap(this.data.set),
      tap(() => this.dataSource.data = this.data()),
      tap(() => {
          this.showCasesChart.set(filter.showCharts && filter.showCases);
          this.showVaccinationChart.set(filter.showCharts && filter.showVaccination);
        }),
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }  
  
  sortChange(sortState: Sort) {
    this.dataSource.sort = this.sort;
  }
}
