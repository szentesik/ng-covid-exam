import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CaseInfo } from './models/cases.model';
import { VaccinationInfo } from './models/vaccination.model';

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

  getVaccination(country: string) {
    return this.http.get<VaccinationInfo>(`${this.BASE_URL}/vaccines?country=${country}`);
  }
}
