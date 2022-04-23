import { BuildingType } from "../server/building/building-type";
import { Tree } from "../server/building/tree";
import { Factory } from "./factory-impl";

export const buildingFactory = new Factory<BuildingType>();

buildingFactory.addImpl(BuildingType.TREE, Tree)
