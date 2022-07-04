export type EnumSubtypes<Target> = {
  [Key in keyof Target]: Target[Key] & { discriminator: Key }
}[keyof Target]


export abstract class Actor<MessagesMap, Actors extends ActorsMap> {
  __typeof_map__!: MessagesMap

  protected readonly bus!: MessageBus<Actors>

  abstract init(): void

  abstract onMessage(message: EnumSubtypes<MessagesMap>): void
}


export interface ActorsMap {
  [key: string]: Actor<unknown, this>
}


export class MessageBus<Actors extends ActorsMap> {
  constructor(public actors: Actors) {
    for (const actor in actors) {
      new Promise<void>((resolve) => {
        Object.defineProperty(actors[actor], "bus", this)
        actors[actor]?.init()
        resolve()
      })
    }
  }

  emit<
    A extends keyof Actors,
    M extends keyof Actors[A]["__typeof_map__"]
  > (
    actorLabel: A,
    messageLabel: M, 
    message: Actors[A]["__typeof_map__"][M]
  ) {
    new Promise<void>((resolve) => {
      Object.defineProperty(message, "discriminator", messageLabel)
      // @ts-ignore
      this.actors[actorLabel]?.onMessage(message)
      resolve()
    })
  }
}
