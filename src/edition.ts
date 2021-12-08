import { Address, dataSource } from "@graphprotocol/graph-ts";
import { SingleEditionMintable as EditionContract } from "../generated/templates/SingleEditionMintable/SingleEditionMintable";
import {
  Approval,
  ApprovalForAll,
  EditionSold,
  OwnershipTransferred,
  PriceChanged,
  Transfer,
} from "../generated/templates/SingleEditionMintable/SingleEditionMintable";
import { Edition, Purchase } from "../generated/schema";

let context = dataSource.context();
let editionId = context.getString("editionId");

export function handleEditionSold(event: EditionSold): void {
  let purchase = new Purchase(event.transaction.hash.toString());
  purchase.address = event.params.owner.toHexString();
  purchase.price = event.params.price;
  purchase.save();

  let edition = Edition.load(editionId);
  if (!edition) edition = new Edition(editionId);
  edition.purchased.push(event.transaction.hash.toString());
  const editionContract = EditionContract.bind(
    Address.fromString(edition.address)
  );
  edition.totalSupply = editionContract.totalSupply();
  edition.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let edition = Edition.load(editionId);
  if (!edition) edition = new Edition(editionId);

  edition.owner = event.params.newOwner.toHexString();
  edition.save();
}

export function handlePriceChanged(event: PriceChanged): void {
  let edition = Edition.load(editionId);
  if (!edition) edition = new Edition(editionId);
  edition.salePrice = event.params.amount;
  edition.save();
}

export function handleTransfer(event: Transfer): void {}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}
