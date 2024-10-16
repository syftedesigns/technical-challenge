import { Resolver, Query, Mutation } from "@nestjs/graphql";
import { VehiclesService } from "./vehicles.service";
import { Make } from "src/models/make.model";

@Resolver(() => Make)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Mutation(() => Boolean)
  createVehicles() {
    return this.vehiclesService.create();
  }

  @Query(() => [Make], { name: "vehicles" })
  findAll() {
    return this.vehiclesService.findAll();
  }
}
