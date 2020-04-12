import {
  BUILDER,
  CLAIMER,
  HARVESTER,
  KILLER,
  PICKUP,
  REPAIRER,
  ROOM_BUILDER,
  UNDERTAKER,
  UPGRADER, VISITOR,
  WORKS
} from './Constants';
import {PositionUtil} from './Utils/PositionUtil';

export class CreepCreator {
  private static defaultBody: BodyPartConstant[] = [MOVE, CARRY, WORK];
  public static inProgress: boolean = false;

  private static buildName(spawn: StructureSpawn, work: WORKS, counter: number = 0): string {
    return `${spawn.room.name}_${work}_${counter}`;
  }

  public static build(spawn: StructureSpawn, work: WORKS, opts: SpawnOptions = {}): void {
    if (CreepCreator.inProgress) {
      return;
    }

    const bodyPartNumber: number = 50;
    const bodyBasePart: number = CreepCreator.defaultBody.length;
    const freePart: number = bodyPartNumber - bodyBasePart;

    let bodyPartRequired: any[] = [];

    switch (work) {
      case ROOM_BUILDER:
        bodyPartRequired = [
          {body: CARRY, value: 30},
          {body: WORK, value: 30},
          {body: MOVE, value: 40}
        ];
        break;
      case HARVESTER:
      case UPGRADER:
      case BUILDER:
      case PICKUP:
      case UNDERTAKER:
        bodyPartRequired = [
          {body: CARRY, value: 25},
          {body: WORK, value: 25},
          {body: MOVE, value: 50}
        ];
        break;
      case VISITOR:
        bodyPartRequired = [
          {body: CARRY, value: 20},
          {body: WORK, value: 20},
          {body: MOVE, value: 60}
        ];
        break;
      case REPAIRER:
        bodyPartRequired = [
          {body: CARRY, value: 30},
          {body: WORK, value: 30},
          {body: MOVE, value: 40}
        ];
        break;
      case KILLER:
        bodyPartRequired = [
          {body: TOUGH, value: 20},
          {body: MOVE, value: 42},
          {body: ATTACK, value: 34},
          {body: CARRY, value: 2},
          {body: WORK, value: 2}
        ];
        break;
      case CLAIMER:
        bodyPartRequired = [
          {body: MOVE, value: 58},
          {body: CLAIM, value: 2},
          {body: CARRY, value: 20},
          {body: WORK, value: 20}
        ];
        break;
      default:
        throw new Error(`No creeps work found.`);
    }

    let bodyPart: BodyPartConstant[] = [];

    for (let i = freePart; i > 0; i--) {
      bodyPart = [];

      for (const k in bodyPartRequired) {
        const row: { body: BodyPartConstant, value: number } = bodyPartRequired[k];
        const bodyPartCounter: number = i * (row.value / 100);

        for (let j = 0; j < bodyPartCounter; j++) {
          bodyPart.push(row.body);
        }
      }

      let spawnCreep: ScreepsReturnCode;
      let counter: number = 0;
      let creepName: string;

      do {
        creepName = CreepCreator.buildName(spawn, work, counter);
        let source: Source | undefined;

        if (work === HARVESTER) {
          source = CreepCreator.getTargetSource(spawn, counter);
        }

        spawnCreep = spawn.spawnCreep(
          bodyPart,
          creepName,
          // @ts-ignore
          {
            memory: {
              role: work,
              source: source ? source.id : null,
              spawnName: spawn.name,
              ...opts.memory
            },
          }
        );
        counter++;
      } while (spawnCreep === ERR_NAME_EXISTS);

      if (spawnCreep === OK) {
        CreepCreator.inProgress = true;
        if (!spawn.memory.creeps) {
          spawn.memory.creeps = [];
        }

        spawn.memory.creeps.push(creepName);
        break;
      }
    }
  }

  private static getTargetSource(spawn: StructureSpawn, counter: number): Source | undefined {
    const sources: Source[] = PositionUtil.closestSources(spawn.pos, true);

    const sourcesLength = sources.length;

    return sources[counter % sourcesLength];
  }
}
