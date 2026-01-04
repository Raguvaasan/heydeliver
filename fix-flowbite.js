import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const filePath = join(__dirname, 'node_modules', 'flowbite-react', 'lib', 'esm', 'components', 'Navbar', 'NavbarToggle.js')
  
  let content = readFileSync(filePath, 'utf8')
  
  // Replace GoThreeBars with GoDotFill
  content = content.replace(/GoThreeBars/g, 'GoDotFill')
  
  writeFileSync(filePath, content, 'utf8')
  
  console.log('✅ Fixed flowbite-react import issue')
} catch (error) {
  console.log('⚠️ Could not fix flowbite-react:', error.message)
  // Don't fail the build if this doesn't work
  process.exit(0)
}
