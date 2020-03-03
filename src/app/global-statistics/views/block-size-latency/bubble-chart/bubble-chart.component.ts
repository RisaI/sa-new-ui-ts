import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MetricService, OperationData, ThreeDimensionValue} from '../../../../metric.service';
import {ApexAxisChartSeries} from 'ng-apexcharts';
import {OperationType} from '../../../../common/models/metrics/operation-type.enum';
import {Coordinates, XaxisComponent} from './xaxis/xaxis.component';
import {YaxisComponent} from './yaxis/yaxis.component';

export interface Serie {
  name: string;
  data: number[][];
}

export interface PopUpConfig {
  positionX: number;
  positionY: number;
  value: number;
}

export interface BubbleChartData {
  series: Serie[];
  xlabels: number[];
  ylabels: number[];
  crossing: { x: number, y: number };
  xlabel: string;
  ylabel: string;
  colors: string[];
  xFormatter: (value, index) => string;
  yFormatter: (value, index) => string;
}

export interface BubbleChartGraphic {
  width: number;
  height: number;
  biggestValueSize: number;
}

@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.css']
})
export class BubbleChartComponent implements OnInit, AfterViewInit, OnChanges {
  private selectedSeries: string[];

  constructor(private readonly metricService: MetricService) {
  }

  @ViewChild('bubble', {static: false})
  bubbleChart: BubbleChartComponent;
  @ViewChild('xaxis', {static: false})
  xaxis: XaxisComponent;
  @ViewChild('yaxis', {static: false})
  yaxis: YaxisComponent;
  data: ApexAxisChartSeries;
  @Input()
  poolIds: number[] = [];
  @Input()
  dates: string[] = []; // TODO should be date
  @Input()
  operations: string[] = ['READ', 'WRITE']; // TODO should be OperationType

  dataToDisplay: Serie[];

  popupDetail: PopUpConfig;
  displayedPopup = false;

  chartData: BubbleChartData = {
    series: [],
    xlabels: [0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
    ylabels: [0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256],
    crossing: {x: 32, y: 1},
    xlabel: 'Block Size [KB]',
    ylabel: 'Latency [ms]',
    colors: ['#008FFB', '#00E396'],
    xFormatter: (value, index) => value + ' KB',
    yFormatter: (value, index) => value + ' ms',
  };
  optionsGraphic: BubbleChartGraphic = {
    width: 900,
    height: 500,
    biggestValueSize: 70,
  };
  coordinatesX: Coordinates;
  coordinatesY: Coordinates;

  ngOnInit() {
    console.log(this.dates);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.poolIds.length > 0 && this.dates.length > 0) {
      this.metricService.getLatencyData(this.poolIds, this.dates, this.operations).subscribe(data => {
          this.chartData.series = this.transformData(data);
          this.selectedSeries = this.chartData.series.map(serie => serie.name);
          console.log(this.selectedSeries);
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.coordinatesX = this.xaxis.getCoordinates();
    this.coordinatesY = this.yaxis.getCoordinates();
    this.xaxis.setOffSetCoordinates(this.coordinatesY);
    this.yaxis.setOffSetCoordinates(this.coordinatesX);
  }

  transformData(data: OperationData[]): Serie[] {
    const returned = data.map(
      operationData => {
        const min = this.min(operationData.values);
        const max = this.max(operationData.values);
        return {
          name: OperationType[operationData.operation],
          data: operationData.values
            .filter(value => value.z > 0)
            .map(value => this.mapToCoordinates(value, min, max))

        };
      }
    );
    return returned;
  }

  countCircleSize(value, min, max) {
    return (value / max) * this.optionsGraphic.biggestValueSize;
  }

  max(data: ThreeDimensionValue[]) {
    return data.filter(value => value.z > 0).reduce(
      (previousValue, currentValue) =>
        previousValue.z < currentValue.z ? currentValue : previousValue,
      {z: 0}).z;
  }

  min(data: ThreeDimensionValue[]) {
    return data.filter(value => value.z > 0).reduce(
      (previousValue, currentValue) =>
        previousValue.z > currentValue.z ? currentValue : previousValue,
      {z: Number.MAX_SAFE_INTEGER}).z;
  }

  mapToCoordinates(value: ThreeDimensionValue, min, max) {
    return [
      this.xaxis.getCoordinateByLabel(value.x).x,
      this.yaxis.getCoordinateByLabel(value.y).y,
      this.countCircleSize(value.z, min, max)
    ];
  }

  getColor(index: number): string {
    return this.chartData.colors[index];
  }

  filterSeries(selectedSeries: string[]) {
    this.selectedSeries = selectedSeries;
  }

  isSelectedSerie(serieName: string) {
    return this.selectedSeries.some(selectedSerie => selectedSerie === serieName);
  }

  displayPopup($event: MouseEvent, circle: number[]) {
    console.log($event);
    console.log(circle);
    this.displayedPopup = true;
    this.popupDetail = {positionX: $event.layerX, positionY: $event.layerY, value: Math.random()};
  }

  displayClose($event: MouseEvent) {
    this.displayedPopup = false;
    this.popupDetail = {positionX: $event.layerX, positionY: $event.layerY, value: null};
  }
}
