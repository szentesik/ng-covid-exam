import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { InfoComponent } from "../info/info.component";

@Component({
  selector: 'app-list-info',
  standalone: true,
  imports: [InfoComponent],
  templateUrl: './list-info.component.html',
  styleUrl: './list-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInfoComponent {
  protected countries = signal<string[]>(['France', 'Hungary']);
}
