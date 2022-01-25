import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { merge, shareReplay } from 'rxjs/operators';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';

export interface ApiBlock {
  bits: number;
  difficulty: number;
  height: number;
  nonce: number;
  size: number;
  confirmations: number;
  hash: string;
  nextBlockHash: string;
  previousBlockHash: string;
  transactionCount: number;
  reward: number;
  minedBy: string;
  time: Date;
  timeNormalized: Date;
}

export interface AppBlock {
  bits: string;
  difficulty: number;
  height: number;
  nonce: number;
  size: number;
  confirmations: number;
  virtualSize: number;
  hash: string;
  time: number;
  minedBy: string;
  tx: {
    length: number;
  };
  txlength: number;
  previousblockhash: string;
  nextblockhash: string;
  poolInfo: {
    poolName: string;
    url: string;
  };
  reward: number;
}

@Injectable()
export class BlocksProvider {
  public chainNetworkTipValues;
  public currentChainNetwork;
  public tipValue;

  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    private api: ApiProvider
  ) {}

  public toAppBlock(block: ApiBlock): AppBlock {
    return {
      bits: (block.bits).toString(16),
      difficulty: block.difficulty,
      height: block.height,
      confirmations: block.confirmations,
      nonce: block.nonce,
      size: block.size,
      virtualSize: block.size,
      hash: block.hash,
      time: new Date(block.time).getTime() / 1000,
      minedBy: block.minedBy,
      tx: {
        length: block.transactionCount
      },
      txlength: block.transactionCount,
      previousblockhash: block.previousBlockHash,
      nextblockhash: block.nextBlockHash,
      poolInfo: {
        poolName: block.minedBy,
        url: ''
      },
      reward: block.reward
    };
  }

  public getCurrentHeight(
    chainNetwork: ChainNetwork
  ): Observable<ApiBlock> {
    if (
      !this.tipValue ||
      !this.currentChainNetwork ||
      this.currentChainNetwork !== chainNetwork
    ) {
      this.tipValue = this.requestCurrentHeight(chainNetwork).pipe(
        merge(),
        shareReplay(1)
      );
      this.currentChainNetwork = chainNetwork;
    }
    return this.tipValue;
  }

  public requestCurrentHeight(
    chainNetwork: ChainNetwork
  ): Observable<ApiBlock> {
    const heightUrl = `${this.api.getUrl(chainNetwork)}/block/tip`;
    return this.httpClient.get<ApiBlock>(heightUrl);
  }

  public getBlocks(
    chainNetwork: ChainNetwork,
    numBlocks: number = 10
  ): Observable<ApiBlock[]> {
    const url = `${this.api.getUrl(chainNetwork)}/block?limit=${numBlocks}`;
    return this.httpClient.get<ApiBlock[]>(url);
  }

  public getCoinsForBlockHash(
    blockHash: string,
    chainNetwork: ChainNetwork,
    limit: number,
    page: number
  ): Observable<any> {
    const url = `${this.api.getUrl(
      chainNetwork
    )}/tx/?blockHash=${blockHash}`;
    return this.httpClient.get(url);
  }

  /**
   * example: http://localhost:8100/api/BTC/regtest/block?since=582&limit=100&paging=height&direction=1
   */
  public pageBlocks(
    since: number,
    numBlocks: number = 10,
    chainNetwork: ChainNetwork
  ): Observable<ApiBlock[]> {
    const url = `${this.api.getUrl(
      chainNetwork
    )}/block?since=${since}&limit=${numBlocks}&paging=height&direction=-1`;
    return this.httpClient.get<ApiBlock[]>(url);
  }

  public getBlock(
    hash: string,
    chainNetwork: ChainNetwork
  ): Observable<ApiBlock> {
    const url = `${this.api.getUrl(chainNetwork)}/block/${hash}`;
    return this.httpClient.get<ApiBlock>(url);
  }
}
