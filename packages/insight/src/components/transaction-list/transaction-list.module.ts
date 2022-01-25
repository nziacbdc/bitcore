import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { LoaderComponentModule } from '../loader/loader.module';
import { TransactionDetailsComponentModule } from '../transaction-details/transaction-details.module';
import { TransactionListComponent } from './transaction-list';

@NgModule({
  declarations: [TransactionListComponent],
  imports: [
    IonicModule,
    TransactionDetailsComponentModule,
    LoaderComponentModule
  ],
  exports: [TransactionListComponent]
})
export class TransactionListComponentModule {}
