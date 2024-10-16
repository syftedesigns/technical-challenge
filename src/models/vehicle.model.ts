import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VehicleSchema {
  @Field()
  typeId: number;

  @Field()
  typeName: string;
}
