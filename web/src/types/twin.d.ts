declare module 'twin.macro' {
  import { CSSProp, css as cssImport } from '@emotion/react'
  import styledImport from '@emotion/styled'
  const styled: typeof styledImport
  const css: typeof cssImport
  const tw: any
  export { styled, css, tw }
  export default tw
}

import type { CSSProp } from '@emotion/react'

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: CSSProp
      tw?: string
    }
  }
}
