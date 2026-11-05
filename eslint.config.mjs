import obsidianmd from 'eslint-plugin-obsidianmd'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...obsidianmd.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: './tsconfig.json' },
    },
  },
  { ignores: ['main.js', 'src/__mocks__/**', 'src/__tests__/**'] },
  {
    rules: {
      'obsidianmd/ui/sentence-case': [
        'warn',
        { brands: ['PDF Thumbnails', 'pdf.js', 'MinoPDF', 'Ko-fi'], enforceCamelCaseLower: false },
      ],
    },
  },
)
