'use client'
import { Highlight, themes } from 'prism-react-renderer'
import { Prism } from './prism'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import React from 'react'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string | null
}

export const Code: React.FC<Props> = ({ code, language }) => {
  if (!code) return null

  const languageToUse =
    typeof language === 'string' && language.trim().length > 0 ? language : 'text'

  return (
    <Highlight prism={Prism} code={code} language={languageToUse} theme={themes.vsDark}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ className: 'table-row', line })}>
              <span className="table-cell select-none text-right text-white/25">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
