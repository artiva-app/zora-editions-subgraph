import {
  CreatedEdition,
  CuratorEditions,
  EditionSold,
  PriceChanged,
} from "../generated/CuratorEditions/CuratorEditions";
import { Edition, Purchase } from "../generated/schema";
import { Address, log } from "@graphprotocol/graph-ts";
import { SingleEditionMintable as EditionContract } from "../generated/templates/SingleEditionMintable/SingleEditionMintable";

export function handleCreatedEdition(event: CreatedEdition): void {
  const editionCuratorContract = CuratorEditions.bind(event.address);
  const id = event.params.editionId;

  let edition = Edition.load(id.toHexString());
  if (!edition) edition = new Edition(event.params.editionId.toHexString());
  edition.salePrice = editionCuratorContract.editionIdToSalePrice(id);
  edition.save();
}

export function handleEditionSold(event: EditionSold): void {
  const editionId = event.params.editionId.toHexString();
  let purchase = new Purchase(event.transaction.hash.toString());
  purchase.address = event.params.owner.toHexString();
  purchase.price = event.params.price;
  purchase.edition = editionId;
  purchase.purchasedAtTimestamp = event.block.timestamp;
  purchase.save();

  let edition = Edition.load(editionId);
  if (!edition) edition = new Edition(editionId);
  const editionContract = EditionContract.bind(
    Address.fromString(edition.address)
  );
  edition.totalSupply = editionContract.totalSupply();
  edition.balance = edition.balance.plus(edition.salePrice);

  edition.save();
}

export function handlePriceChanged(event: PriceChanged): void {
  const editionId = event.params.editionId.toHexString();
  let edition = Edition.load(editionId);
  if (!edition) edition = new Edition(editionId);
  edition.salePrice = event.params.amount;
  edition.save();
}
