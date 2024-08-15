import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { countries } from '../countries';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MatExpansionModule, MatListModule, MatSlideToggleModule, MatButtonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  protected countries = signal<string[]>(countries.toSorted());
}
