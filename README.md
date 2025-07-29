# Fullstack App Generator

A visual drag-and-drop tool for generating fullstack application architectures. Built with React, Vite, and TailwindCSS.

## Features

- 🎯 **Visual Architecture Design**: Drag and drop components to build your application architecture
- 🔗 **Component Connections**: Create connections between components to define relationships
- ⚙️ **Property Configuration**: Configure component properties and settings
- 📦 **Code Generation**: Generate project code based on your visual design
- 💾 **Project Management**: Save, load, and manage multiple projects
- 🎨 **Modern UI**: Beautiful, responsive interface with TailwindCSS

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fullstack-app-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.js     # Authentication modal
│   ├── Canvas.js        # Main canvas component
│   ├── Dashboard.js     # Project dashboard
│   ├── Header.js        # Application header
│   └── ...
├── data/               # Data files
│   └── techStack.js    # Technology stack definitions
├── hooks/              # Custom React hooks
│   └── useCanvasState.js
├── styles/             # Additional styles
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Usage

1. **Create a New Project**: Click "Create New Project" and enter project details
2. **Add Components**: Drag technology components from the sidebar to the canvas
3. **Connect Components**: Use the connection tool to link components together
4. **Configure Properties**: Select components to configure their properties
5. **Save Your Work**: Use the save button to persist your project
6. **Generate Code**: Use the properties panel to generate project code

## Development

### Adding New Components

1. Add component definitions to `src/data/techStack.js`
2. Update the sidebar to include the new component category
3. Add any necessary styling in `src/index.css`

### Customizing Styles

The project uses TailwindCSS for styling. Custom styles can be added in:
- `src/index.css` for global styles
- Component-specific CSS classes
- Tailwind configuration in `tailwind.config.js`

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 