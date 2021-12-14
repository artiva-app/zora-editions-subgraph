import { BigInt, DataSourceContext } from "@graphprotocol/graph-ts";
import { CreatedEdition } from "../generated/SingleEditionMintableCreator/SingleEditionMintableCreator";
import { SingleEditionMintable as EditionContract } from "../generated/templates/SingleEditionMintable/SingleEditionMintable";
import { Edition as EditionEntity } from "../generated/schema";
import { SingleEditionMintable as EditionTemplate } from "../generated/templates";

export function handleCreatedEdition(event: CreatedEdition): void {
  const address = event.params.editionContractAddress;
  const context = new DataSourceContext();

  const editionContract = EditionContract.bind(address);

  let edition = new EditionEntity(event.params.editionId.toHexString());
  edition.name = editionContract.name();
  edition.owner = editionContract.owner().toHexString();
  edition.creator = editionContract.owner().toHexString();
  edition.description = editionContract.try_description().value;
  edition.editionSize = editionContract.editionSize();
  edition.balance = BigInt.zero();
  edition.imageURL = editionContract.imageUrl();
  edition.imageHash = editionContract.imageHash();
  edition.animationURL = editionContract.animationUrl();
  edition.animationHash = editionContract.animationHash();
  edition.totalSupply = editionContract.totalSupply();
  edition.salePrice = editionContract.salePrice();
  edition.address = event.params.editionContractAddress.toHexString();
  edition.save();

  context.setString("editionId", event.params.editionId.toHexString());
  EditionTemplate.createWithContext(address, context);
}
