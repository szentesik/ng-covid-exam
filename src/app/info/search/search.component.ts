import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { countries } from '../countries';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Filter } from '../models/filter.model';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatExpansionModule, MatListModule, MatSlideToggleModule, MatButtonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
    
  protected countries = signal<string[]>(countries.toSorted());

  @Input() selectedCountries = countries.toSorted();

  @Input() showCases = true;

  @Input() showVaccination = true; 

  @Output() onSubmit = new EventEmitter<Filter>;

  filterForm?: FormGroup; 
  countriesControl = new FormControl();

  //TODO: avoid electedCountries.includes function call
  //countryStates?: {country: string; selected?: boolean;} [];

  ngOnInit() {

    // TODO: validade to assure that at least one option is selected
    this.filterForm = new FormGroup({
      countries: this.countriesControl,
      showCases: new FormControl<boolean>(this.showCases),
      showVaccination: new FormControl<boolean>(this.showVaccination),
    });  
  }

  submit() {
    // TODO: Csak regisztrált látogatók, vagy olyanok látogathatják az oldalt, akik
    // még nem küldtek be három keresést
    if(!this.filterForm) {
      return;
    }   

    this.onSubmit.emit({      
      countries: this.countriesControl.value ?? this.selectedCountries,
      showCases: this.filterForm.value.showCases,
      showVaccination: this.filterForm.value.showVaccination,
    });  
  } 
}
