import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  {
    ignores: ['node_modules/', '.next/'],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    rules: {
      semi: ['warn', 'never'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@next/next/no-img-element': 'off',
      'react/no-danger': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['src/__tests__/**/*'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
]
