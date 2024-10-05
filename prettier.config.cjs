/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  endOfLine: 'lf',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react$',
    '^next$',
    '^remix$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^(@api|@assets|@ui|src|app|@/hooks|@/components)(/.*)$',
    '',
    '^(?!.*[.]css$)[./].*$',
    '.css$'
  ],

  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true
}
