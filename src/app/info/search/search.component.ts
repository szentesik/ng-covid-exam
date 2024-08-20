import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { countries } from '../countries';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
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
    
  protected countries = signal<string[]>(countries.toSorted()); // Valid countries in order

  @Input() selectedCountries = countries.toSorted();    // Initially selected countries

  @Input() showCases = true;

  @Input() showVaccination = true; 

  @Input() showCharts = true;

  @Output() onSubmit = new EventEmitter<Filter>;

  protected panelOpenState = signal(false);
  
  filterForm?: FormGroup; 
  countriesControl = new FormControl();
  
  countryStates = signal<{country: string; selected?: boolean;}[]>([]);

  atLeastOneDataSelectedValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {    
    return control.value.showCases || control.value.showVaccination
      ? null
      : { NoDataSelected: true };      
  };  

  ngOnInit() {

    // Set up initial checkbox states (to avoid function call from template)
    this.countries().forEach(country => {
      this.countryStates.set([
        ...this.countryStates(),
        { 
          country, 
          selected: this.selectedCountries.includes(country) 
        }
      ])
    })
    
    this.filterForm = new FormGroup({
      countries: this.countriesControl,
      showCases: new FormControl<boolean>(this.showCases),
      showVaccination: new FormControl<boolean>(this.showVaccination),
      showCharts: new FormControl<boolean>(this.showCharts),
    },
      this.atLeastOneDataSelectedValidator,
    );  
  }

  submit() {    
    if(!this.filterForm) {
      return;
    }
    
    this.panelOpenState.set(false);

    this.onSubmit.emit({      
      countries: this.countriesControl.value ?? this.selectedCountries,
      showCases: this.filterForm.value.showCases,
      showVaccination: this.filterForm.value.showVaccination,
      showCharts: this.filterForm.value.showCharts,
    });  
  } 
}
