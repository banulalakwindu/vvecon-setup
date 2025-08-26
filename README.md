# VVECON Setup Package

A powerful CLI tool to automate the setup process for VVECON projects.

## Installation

```bash
npm install -g vvecon-setup
```

## Usage

```bash
vvecon-setup
```

## Features

- 🚀 Automated Laravel project setup
- 🔧 Composer dependency management
- 📝 Environment configuration
- 🗄️ Database migration and seeding
- 🎨 Frontend asset building
- ⚡ Production optimizations
- 🎯 Interactive setup wizard

## What it does

1. **Cleans composer.lock** - Removes existing lock file
2. **Installs dependencies** - Runs composer install (no-scripts first, then with scripts)
3. **Environment setup** - Creates .env from .env.example and generates APP_KEY
4. **Storage setup** - Cleans and recreates storage symlinks
5. **Database setup** - Runs migrations and optional seeding
6. **Icon caching** - Caches application icons
7. **Asset building** - Optional frontend asset compilation
8. **Production optimization** - Optional caching and optimization

## Requirements

- Node.js 16+
- PHP 8.0+
- Composer
- Laravel project structure

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Banula Lakwindu <banulalakwindu10@gmail.com>