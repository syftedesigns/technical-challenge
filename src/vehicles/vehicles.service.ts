import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Make, MakeDocument } from "src/models/make.model";
import { XmlTransformService } from "src/services/xmlTransform.service";

@Injectable()
export class VehiclesService {
  constructor(
    private xmlParser: XmlTransformService,
    @InjectModel(Make.name) private makeVehicleModel: Model<MakeDocument>,
  ) {}

  async create(): Promise<boolean> {
    const vehicles = await this.xmlParser.getAllVehiclesByType(20);
    console.log("process finished");
    await this.makeVehicleModel.insertMany(vehicles.flat());
    // Requiriment: Expose the get values only in the Query.
    return true;
  }

  findAll() {
    return this.makeVehicleModel.find();
  }
}
