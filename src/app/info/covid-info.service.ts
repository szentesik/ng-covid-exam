import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CaseInfo } from './models/cases.model';
import { VaccinationInfo } from './models/vaccination.model';
import { forkJoin, mergeMap, Observable, ObservableInput, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CovidInfoService {

  private readonly BASE_URL = `${environment.baseUrl}`;

  constructor(
    private readonly http: HttpClient
  ) { }
    
  getCases(country: string) {    
    return this.http.get<CaseInfo>(`${this.BASE_URL}/cases?country=${country}`);    
  }

  getCasesMultiple(countries: string[]) {
    let observables: Observable<CaseInfo>[] = [];    
    countries.forEach(country => observables.push(this.getCases(country)))
    return forkJoin(observables);
  }

  getVaccination(country: string) {
    return this.http.get<VaccinationInfo>(`${this.BASE_URL}/vaccines?country=${country}`);
  }

  getVaccinationMultiple(countries: string[]) {
    let observables: Observable<VaccinationInfo>[] = [];    
    countries.forEach(country => observables.push(this.getVaccination(country)))
    return forkJoin(observables);
  }
}
