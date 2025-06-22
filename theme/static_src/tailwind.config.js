/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../templates/**/*.html',
    '../../templates/**/*.html',
    '../../**/templates/**/*.html',
    '../../**/*.py',
    // Adicione o caminho para o seu arquivo JS
    '../static/mapa/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Classes do container
    'flex',
    'space-x-2',
    'bg-white',
    'p-2',
    'rounded-lg',
    'shadow-lg',
    'border',
    'border-gray-200',

    // Classes gerais dos botões
    'text-white',
    'font-semibold',
    'py-2',
    'px-4',
    'rounded',
    'transition-colors',
    'duration-200',
    'cursor-pointer',
    'font-xl',

    'flex-grow', 'px-3', 'py-2', 'border', 'border-gray-300',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500',
    'focus:border-transparent', 'text-sm', 'bg-blue-600',
    'text-white', 'hover:bg-blue-700', 'transition-colors',
    'font-medium', 'gap-2'
  ]
}