import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { Make as MakeModel } from "../models/make.model";
import { convertArrayIntoBatches, sleep, USER_AGENTS } from "../utils/utils";
import { parseStringPromise } from "xml2js";

type Make = Pick<MakeModel, "makeId" | "makeName">;

@Injectable()
export class XmlTransformService {
  constructor(
    private config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async parseXmlToJson(payload: string) {
    return await parseStringPromise(payload);
  }

  public async getAllMakes(): Promise<Array<Make>> {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.config.get("VPIC_API_URL")}/getallmakes`, {
          params: { format: "XML" },
        })
        .pipe(
          catchError((err: AxiosError) => {
            throw err;
          }),
        ),
    );
    const allMakes = await this.parseXmlToJson(data);
    if (!allMakes.Response?.Results?.length) {
      throw new HttpException(
        "No Make values available ",
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    const makerResults = allMakes.Response.Results[0]
      ?.AllVehicleMakes as Array<any>;
    const transformedMakerValues: Array<Make> = await Promise.all(
      makerResults.map(({ Make_ID, Make_Name }) => ({
        makeId: Make_ID[0],
        makeName: Make_Name[0],
      })),
    );

    return transformedMakerValues;
  }

  public async getAllVehiclesByType(
    batchSize = 100,
  ): Promise<Array<MakeModel>> {
    const vehicleMakers = await this.getAllMakes();
    // Making so many calls throws an issue so we're processing the array in Batches
    const batches = convertArrayIntoBatches(vehicleMakers, batchSize);
    const results = [];

    for (let cursor = 0; cursor < batches.length; cursor++) {
      console.log(`Processing batch ${cursor + 1}/${batches.length} Array`);
      const vehicleTypes = await Promise.all(
        batches[cursor].map(async (make) => {
          sleep(2000);
          const { data } = await firstValueFrom(
            this.httpService
              .get(
                `${this.config.get("VPIC_API_URL")}/GetVehicleTypesForMakeId/${make.makeId}`,
                {
                  params: { format: "XML" },
                  // Trick: Simulates a new agent per batch to avoid block
                  headers: {
                    "User-Agent":
                      USER_AGENTS[
                        Math.floor(Math.random() * USER_AGENTS.length)
                      ],
                  },
                },
              )
              .pipe(
                catchError((err: AxiosError) => {
                  throw err;
                }),
              ),
          );
          const transformedResponse = await this.parseXmlToJson(data);
          const vehicleTypes = transformedResponse.Response.Results[0]
            ?.VehicleTypesForMakeIds as Array<any>;
          return {
            ...make,
            vehicleTypes:
              vehicleTypes?.map(({ VehicleTypeId, VehicleTypeName }) => ({
                typeId: VehicleTypeId[0],
                typeName: VehicleTypeName[0],
              })) || [],
          };
        }),
      );

      results.push(vehicleTypes);
      // if (cursor === 3) break;  // ENABLE THIS FOR QUICK TEST :)

      if (cursor < batches.length - 1) {
        // Avoid ban ip
        await sleep(10000);
      }
    }

    return results;
  }
}
