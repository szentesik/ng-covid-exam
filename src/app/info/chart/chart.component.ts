import { Component, Input, OnInit } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CovidInfo } from '../models/covid-info.model';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  
  Highcharts: typeof Highcharts = Highcharts;

  @Input({required: true}) dataSource!: CovidInfo[];

  @Input({required: true}) type!: 'cases' | 'vaccination';

  readonly CHART_TYPE: 'bar' | 'column' = 'bar';

  chartOptions?: Highcharts.Options; 

  private generateSeries(type: 'cases' | 'vaccination') : Highcharts.SeriesOptionsType[] {
    if(type === 'cases') {
      return [
        {
          data: this.dataSource.map(info => (info.population ?? 0) - (info.confirmed ?? 0)),
          name: 'Unconfirmed',
          type: this.CHART_TYPE
        },
        {
          data: this.dataSource.map(info => info.deaths ?? 0),
          name: 'Deaths',
          type: this.CHART_TYPE
        },
        {
          data: this.dataSource.map(info => (info.confirmed ?? 0) - (info.deaths ?? 0)),
          name: 'Recovered',
          type: this.CHART_TYPE
        },
      ];
    } else {
      return [
        {
          data: this.dataSource.map(info => (info.population ?? 0) - (info.people_vaccinated ?? 0)),
          name: 'Not vaccinated',
          type: this.CHART_TYPE
        },
        {
        data: this.dataSource.map(info => info.people_vaccinated ?? 0),
        name: 'Vaccinated ',
        type: this.CHART_TYPE
        }
      ];
    }
  }

  ngOnInit() { 
    
    const title = this.type === 'cases' ? 'Infection by country': 'Vaccination by country';
    const categories = this.dataSource.map(info => info.country ?? 'N/A');
    const series = this.generateSeries(this.type);    

    this.chartOptions = {    
      title: {
          text: title,
          align: 'left'
      },
      credits: {
        enabled: false
      },
      xAxis: {
          categories: categories
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Percent'
          }
      },
      tooltip: {
          pointFormat: '<span style="color:{series.color}">{series.name}</span>' +
              ': <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
          shared: true
      },
      plotOptions: {
          column: {
              stacking: 'percent',
              dataLabels: {
                  enabled: true,
                  format: '{point.percentage:.0f}%'
              }
          },
          bar: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                format: '{point.percentage:.0f}%'
            }
        }
      },
      series: series
      /*
      [{
        data: this.dataSource.map(info => info.deaths ?? 0),
        name: 'Deaths',
        type: this.CHART_TYPE
      },
      {
        data: this.dataSource.map(info => (info.confirmed ?? 0) - (info.deaths ?? 0)),
        name: 'Recovered',
        type: this.CHART_TYPE
      },
      {
        data: this.dataSource.map(info => (info.population ?? 0) - (info.confirmed ?? 0)),
        name: 'Unaffected',
        type: this.CHART_TYPE
      }]
      */
    }    
  } 

}
