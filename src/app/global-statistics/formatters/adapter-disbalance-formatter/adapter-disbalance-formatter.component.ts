import {Component, Input, OnInit} from '@angular/core';
import {SystemMetric} from '../../../common/models/metrics/SystemMetric';
import {SasiColumn, SasiRow} from '../../../common/components/sasi-table/sasi-table.component';
import {SystemMetricType} from '../../../common/models/metrics/SystemMetricType';

@Component({
  selector: 'app-adapter-disbalance-formatter',
  templateUrl: './adapter-disbalance-formatter.component.html',
  styleUrls: ['./adapter-disbalance-formatter.component.css']
})
export class AdapterDisbalanceFormatterComponent implements OnInit {

  @Input() label;
  @Input() public data: SystemMetric;
  @Input() public column: SasiColumn;
  @Input() public rowData: SasiRow;
  @Input() displayName = false;

  constructor() {
  }

  ngOnInit() {
  }

  getInfoMessage() {
    return `(${this.resolveAbsoluteDisbalance()} [MB/s] -> ${this.data.value}%`;
  }

  private resolveAbsoluteDisbalance() {
    return this.resolveDisbalance(SystemMetricType.IMBALANCE_ABSOLUT);
  }

  private resolveRelativeDisbalance() {
    return this.resolveDisbalance(SystemMetricType.IMBALANCE_PERC);
  }


  private resolveDisbalance(type: SystemMetricType): string {
    if (this.rowData !== undefined && this.rowData.getCell(type) != null) {
      return this.rowData.getCell(type).value;
    }
  }


  private isVisible() {
    if (this.rowData !== undefined && parseInt(this.rowData.getCell(SystemMetricType.IMBALANCE_EVENTS).value, 10) > 0) {
      return true;
    }
    return false;
  }

  private getName() {
    return this.rowData.getCell('name').value;
  }

}