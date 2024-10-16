import { Field, ObjectType } from "@nestjs/graphql";
import { VehicleSchema } from "./vehicle.model";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MakeDocument = HydratedDocument<Make>;

@ObjectType()
@Schema()
export class Make {
  @Field()
  @Prop({ required: true })
  makeId: number;

  @Field()
  @Prop({ required: true })
  makeName: string;

  @Field(() => [VehicleSchema])
  @Prop([VehicleSchema])
  vehicleTypes: VehicleSchema[];
}

export const MakeSchema = SchemaFactory.createForClass(Make);
