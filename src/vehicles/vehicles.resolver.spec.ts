import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { XmlTransformService } from "../services/xmlTransform.service";

const mockXMLGetAllMakeData = `
<Response>
  <Results>
    <AllVehicleMakes>
      <Make_ID>440</Make_ID>
      <Make_Name>Acura</Make_Name>
    </AllVehicleMakes>
    <AllVehicleMakes>
      <Make_ID>441</Make_ID>
      <Make_Name>Honda</Make_Name>
    </AllVehicleMakes>
  </Results>
</Response>
`;

const mockXMLGetVehicleTypeForMakeIdMock = `
<Response>
  <Results>
    <VehicleTypesForMakeIds>
      <VehicleTypeName>Passenger Car</VehicleTypeName>
        <VehicleTypeId>6</VehicleTypeId>
        <VehicleTypeName>Trailer</VehicleTypeName>
    </VehicleTypesForMakeIds>
    <VehicleTypesForMakeIds>
      <VehicleTypeId>8</VehicleTypeId>
      <VehicleTypeName>Truck</VehicleTypeName>
    </VehicleTypesForMakeIds>
  </Results>
</Response>
`;

const mockParsedValue = [
  {
    makeId: "440",
    makeName: "Acura",
    vehicleTypes: [
      {
        typeId: "6",
        typeName: "Passenger Car",
      },
      {
        typeId: "8",
        typeName: "Truck",
      },
    ],
  },
  {
    makeId: "441",
    makeName: "Honda",
    vehicleTypes: [
      {
        typeId: "6",
        typeName: "Passenger Car",
      },
      {
        typeId: "8",
        typeName: "Truck",
      },
    ],
  },
];

describe("XMLParserMock", () => {
  let service: XmlTransformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XmlTransformService,
        { provide: HttpService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<XmlTransformService>(XmlTransformService);
  });

  it("simulates vpic nhtsa XML data to JSON", async () => {
    const parsedAllMake = await service["parseXmlToJson"](
      mockXMLGetAllMakeData,
    );
    const parsedVehicleTypes = await service["parseXmlToJson"](
      mockXMLGetVehicleTypeForMakeIdMock,
    );

    const makerResults = parsedAllMake.Response.Results[0].AllVehicleMakes;
    const vehicleTypeResults =
      parsedVehicleTypes.Response.Results[0].VehicleTypesForMakeIds;

    const transformedMakerValues = makerResults.map(
      ({ Make_ID, Make_Name }: any) => ({
        makeId: Make_ID[0],
        makeName: Make_Name[0],
        vehicleTypes: vehicleTypeResults.map(
          ({ VehicleTypeId, VehicleTypeName }: any) => ({
            typeId: VehicleTypeId[0],
            typeName: VehicleTypeName[0],
          }),
        ),
      }),
    );

    expect(transformedMakerValues).toEqual(mockParsedValue);
  });
});
