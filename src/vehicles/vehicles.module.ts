import { Module } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { VehiclesResolver } from "./vehicles.resolver";
import { XmlTransformService } from "src/services/xmlTransform.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { MongooseModule } from "@nestjs/mongoose";
import { Make, MakeSchema } from "src/models/make.model";

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([{ name: Make.name, schema: MakeSchema }]),
  ],
  providers: [VehiclesResolver, VehiclesService, XmlTransformService],
})
export class VehiclesModule {}
