/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface ILFeiPairCalleeInterface extends ethers.utils.Interface {
  functions: {
    "lFeiPairCall(address,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "lFeiPairCall",
    values: [string, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "lFeiPairCall",
    data: BytesLike
  ): Result;

  events: {};
}

export class ILFeiPairCallee extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ILFeiPairCalleeInterface;

  functions: {
    lFeiPairCall(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "lFeiPairCall(address,uint256,bytes)"(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  lFeiPairCall(
    sender: string,
    amountFeiOut: BigNumberish,
    data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "lFeiPairCall(address,uint256,bytes)"(
    sender: string,
    amountFeiOut: BigNumberish,
    data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    lFeiPairCall(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "lFeiPairCall(address,uint256,bytes)"(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    lFeiPairCall(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "lFeiPairCall(address,uint256,bytes)"(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    lFeiPairCall(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "lFeiPairCall(address,uint256,bytes)"(
      sender: string,
      amountFeiOut: BigNumberish,
      data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
