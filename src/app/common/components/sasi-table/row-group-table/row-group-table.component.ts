import {Component, Input, OnInit} from '@angular/core';
import {SasiGroupRow, SasiTableOptions, slideInOutAnimation} from '../sasi-table.component';
import {LocalStorage, LocalStorageService} from 'ngx-store';
import {SystemMetricType} from '../../../models/metrics/SystemMetricType';
import {SelectedRow} from '../row-table/selected-row';
import {keys} from 'd3-collection';
import {ConditionEvaluate} from '../../../../global-statistics/utils/ConditionEvaluate';
import {AlertRule, Threshold} from '../../../../global-statistics/AlertRule';

export interface AggregatedValues {
  getValue(name: string): number;
}

export interface AggregateValueService {
  computeSummaries(inputRowGroup: SasiGroupRow[], filter: Array<SelectedRow>, options: SasiTableOptions): AggregatedValues;
}

class AlertSummaryValue {
  type: string;
  count: number;

  constructor(type: string, count: number) {
    this.type = type;
    this.count = count;
  }
}

@Component({
  selector: 'app-row-group-table',
  templateUrl: './row-group-table.component.html',
  styleUrls: ['./row-group-table.component.css'],
  animations: slideInOutAnimation
})
export class RowGroupTableComponent implements OnInit {

  @Input() data: SasiGroupRow;
  @Input() columnHighlightEnable = false;
  @Input() options: SasiTableOptions;
  @LocalStorage({key: 'sasi_collapsed'}) collapsedRows: Array<string>;
  @LocalStorage() highlightedColumn = -1;

  aggregatedValues = {};
  selectedRows: Array<SelectedRow>;
  alertGroup = '';
  alertSummary = [];

  alertPriority = ['text-alert-yellow', 'text-orange', 'text-red'];

  constructor(private localStorageService: LocalStorageService) {
    if (this.collapsedRows === null) {
      this.collapsedRows = [];
    } else {
      this.collapsedRows = this.collapsedRows; // this must be reset because save on the collapsedRows doesn't work
    }

  }

  ngOnInit() {
    this.localStorageService.observe(this.options.storageNamePrefix + '_selected').subscribe(
      data => {
        this.selectedRows = data.newValue;
        this.initAggregatedValues();
      }
    );
    this.selectedRows = this.localStorageService.get(this.options.storageNamePrefix + '_selected');
    this.initAggregatedValues();
    this.summarizeAlerts();

  }

  initAggregatedValues() {
    if (this.selectedRows === null) {
      this.selectedRows = [];
    }
    this.aggregateValues(this.selectedRows);
  }

  addCollapsed(systemName: string) {
    if (this.collapsedRows === null) {
      this.collapsedRows = [];
    }
    const index = this.collapsedRows.findIndex(name => name === systemName);
    if (index > -1) {
      this.collapsedRows = this.collapsedRows.filter(name => name !== systemName);
    } else {
      this.collapsedRows.push(systemName);
    }
    // @ts-ignore
    this.collapsedRows.save();
  }

  isCollapsed(systemName: string): boolean {
    return this.collapsedRows.findIndex(value => value === systemName) > -1;
  }

  private aggregateValues(selectedRows: Array<SelectedRow>) {
    const mean = this.options.aggregateValuesService;
    const values = mean.computeSummaries([this.data], selectedRows, this.options);
    const result = {};
    if (values !== null) {
      this.options.getAggregatedColumns().forEach(
        column => result[column.index] = {value: values.getValue(<SystemMetricType>column.index)}
      );
    }
    this.aggregatedValues = result;
  }

  isColumnHighlighted(column: number) {
    if (!this.options.highlightColumn || this.isAggregatedValuesEmpty()) {
      return false;
    }
    return column === this.highlightedColumn;
  }

  setHighlightedColumn(column: number) {
    this.highlightedColumn = column;
  }

  isAggregatedValuesEmpty() {
    return keys(this.aggregatedValues).length === 0;
  }

  onSelectRow(selectedRows: Array<SelectedRow>) {
    this.selectedRows = selectedRows;
    if (this.options.aggregateValuesService !== undefined) {
      this.aggregateValues(selectedRows);
    }
  }


  private getPriority(alertType) {
    return this.alertPriority.findIndex(priority => priority === alertType);
  }

  private getAlertType() {
    const alertDef = this.options.cellDecoratorRules.filter(
      rule => {
        return this.data.rows.forEach(
          row => {
            const cell = row.getCell(rule.type);
            return ConditionEvaluate.eval(cell.value, rule);
          }
        ) !== undefined;
      }
    );
    if (alertDef.length === 0) {
      return '';
    }
    return alertDef.reduce(
      (previousValue, currentValue) => {
        return this.getPriority(previousValue.threshold.alertType) > this.getPriority(currentValue.threshold.alertType)
          ? previousValue : currentValue;
      }
      , new AlertRule(null, new Threshold('', 0, 0))).threshold.alertType;
  }

  private summarizeAlerts() {
    this.initializeSummaryAlerts();
    this.options.cellDecoratorRules.forEach(
      rule => {
        const filteredData = this.data.rows.filter(
          row => {
            const cell = row.getCell(rule.type);
            return cell != null ? ConditionEvaluate.eval(cell.value, rule) : false;
          }
        );
        if (filteredData.length > 0) {
          this.alertSummary.push(new AlertSummaryValue(rule.threshold.alertType, filteredData.length));
        }

      }
    );
  }

  private initializeSummaryAlerts() {
    this.options.cellDecoratorRules.forEach(
      rule => {
        this.alertSummary[rule.threshold.alertType] = 0;
      }
    );
  }

  getAggregatedValue(type: string) {
    return this.aggregatedValues[type];
  }
}
