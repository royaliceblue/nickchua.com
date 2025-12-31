import { Prism as BasePrism } from 'prism-react-renderer'

const globalWithPrism = globalThis as typeof globalThis & {
  Prism?: typeof BasePrism
}

globalWithPrism.Prism = BasePrism

export { BasePrism as Prism }
