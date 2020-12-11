import {Component} from '@angular/core';
import {StorageEntityType} from '../../common/models/dtos/owner.dto';
import {SasiColumnBuilder} from '../../common/components/sasi-table/sasi-table.component';
import {MetricService} from '../../metric.service';
import {FormBusService} from '../form-bus.service';
import {SeTextFormatterComponent} from '../se-text-formatter/se-text-formatter.component';
import {RowTableComponent} from '../../common/components/sasi-table/row-table/row-table.component';
import {SimpleSortImpl} from '../../common/components/sasi-table/simple-sort-impl';
import {StorageEntityList} from '../channel-board-list/channel-board-list.component';
import {StorageEntityStatusComponent} from '../storage-entity-status/storage-entity-status.component';

@Component({
  selector: 'app-dkc-list',
  templateUrl: '../channel-board-list/channel-board-list.component.html',
  styleUrls: ['../channel-board-list/channel-board-list.component.css']
})
export class DkcListComponent extends StorageEntityList {

  constructor(protected metricService: MetricService,
              protected formBus: FormBusService) {
    super(metricService, formBus, StorageEntityType.DKC);
  }

  ngOnInit() {
    this.options.columns.push(
      SasiColumnBuilder.getInstance()
        .withIndex('name')
        .withLabel('DKC')
        .withComponent(SeTextFormatterComponent)
        .withAltSortEnable(false)
        .withIsAggregated(false)
        .build()
    );
    this.options.columns.push(
      SasiColumnBuilder.getInstance()
        .withIndex('status')
        .withLabel('Active')
        .withComponent(StorageEntityStatusComponent)
        .withAltSortEnable(false)
        .build()
    );
    this.options.rowComponentFormatter = RowTableComponent;
    this.options.isDataGrouped = false;
    this.options.highlightRow = true;
    this.options.highlightColumn = false;
    this.options.sortService = new SimpleSortImpl();
    this.options.sortColumnNames = ['name'];
  }
}
