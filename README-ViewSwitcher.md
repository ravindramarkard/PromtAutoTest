# 🔄 VS Code-like View Switcher

A comprehensive view switching system that mimics VS Code's interface with enhanced functionality for the file explorer.

## 🚀 Features

### 📱 **ViewSwitcher Component**
- **Toggle Button Group**: Clean, VS Code-style view switching
- **Tooltips with Shortcuts**: Hover to see keyboard shortcuts
- **Fullscreen Toggle**: F11 support for distraction-free editing
- **Advanced Views Menu**: Additional view options
- **Visual Feedback**: Active state highlighting

### 🎛️ **View Modes**

#### **Primary Views**
1. **Explorer Only** (`Ctrl+Shift+E`)
   - Full-width file tree
   - Maximum space for navigation
   - Perfect for file organization

2. **Split View** (`Ctrl+\`)
   - Explorer + Editor side by side
   - Default balanced layout
   - Best for development workflow

3. **Editor Only** (`Ctrl+Shift+F`)
   - Full-width file editor
   - Distraction-free editing
   - Maximum content space

#### **Advanced Views**
4. **Grid View** (`Ctrl+Shift+G`)
   - Multiple files in grid layout
   - Compact explorer sidebar
   - Multi-file comparison

5. **Zen Mode**
   - Fullscreen editor only
   - No distractions
   - Pure focus mode

6. **Preview Mode**
   - Read-only file viewing
   - Quick file inspection
   - No editing capabilities

7. **Compare Mode**
   - Side-by-side file comparison
   - Diff highlighting
   - Version comparison

## 🎯 **Enhanced Features**

### **📑 File Tabs**
- **Open Files Management**: Track multiple open files
- **Tab Switching**: Click to switch between files
- **Close Buttons**: Individual file closing
- **Active Indicator**: Visual current file highlighting

### **⌨️ Keyboard Shortcuts**
- `Ctrl+\` - Toggle Split View
- `Ctrl+Shift+E` - Explorer Only
- `Ctrl+Shift+F` - Editor Only
- `Ctrl+Shift+G` - Grid View
- `F11` - Toggle Fullscreen
- `Esc` - Exit Fullscreen

### **🎨 Visual Enhancements**
- **Smooth Transitions**: Fade and slide animations
- **Responsive Design**: Adapts to screen sizes
- **Theme Integration**: Follows Material-UI theme
- **Status Indicators**: Current view and file info

## 🛠️ **Component Structure**

```
ExplorerLayout/
├── ViewSwitcher/          # Main view switching component
│   ├── ToggleButtonGroup  # Primary view buttons
│   ├── FullscreenToggle   # F11 fullscreen support
│   └── AdvancedMenu       # Additional view options
├── FileExplorer/          # Tree view component
├── FileViewer/            # File content viewer
└── FileTabs/              # Open files management
```

## 🎮 **Usage Examples**

### **Basic View Switching**
```jsx
<ViewSwitcher
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  isFullscreen={isFullscreen}
  onToggleFullscreen={toggleFullscreen}
/>
```

### **Advanced Layout**
```jsx
<ExplorerLayout>
  {/* Automatically handles all view modes */}
  {/* Includes keyboard shortcuts */}
  {/* Manages file tabs */}
  {/* Provides fullscreen support */}
</ExplorerLayout>
```

## 🎯 **VS Code-like Features**

### **✅ Implemented**
- Toggle button group for view switching
- Keyboard shortcuts matching VS Code
- Fullscreen mode (F11)
- File tabs with close buttons
- Breadcrumb navigation
- Status bar with file info
- Smooth view transitions
- Context-aware tooltips

### **🔄 Enhanced Beyond VS Code**
- Grid view for multiple files
- Advanced view menu
- Zen mode for focus
- Preview mode for quick viewing
- Compare mode for diffs
- Responsive design
- Material-UI integration

## 🎨 **Visual Design**

### **Button States**
- **Default**: Subtle gray background
- **Hover**: Light blue highlight
- **Active**: Primary color background
- **Disabled**: Muted appearance

### **Animations**
- **View Transitions**: Smooth slide effects
- **Tab Changes**: Fade in/out
- **Fullscreen**: Zoom animation
- **Menu Open**: Scale and fade

### **Responsive Behavior**
- **Desktop**: Full button labels
- **Tablet**: Icon + short labels
- **Mobile**: Icons only
- **Fullscreen**: Minimal UI

## 🚀 **Getting Started**

1. **Navigate to Explorer**: Click "📁 Explorer" in navigation
2. **Try View Modes**: Use the toggle buttons in the header
3. **Keyboard Shortcuts**: Press `Ctrl+\` for split view
4. **Fullscreen**: Press `F11` for immersive editing
5. **Advanced Views**: Click the "⋮" menu for more options

## 🎯 **Perfect For**

- **Code Development**: Split view for coding
- **File Management**: Explorer-only for organization
- **Content Writing**: Editor-only for focus
- **Multi-file Work**: Grid view for comparison
- **Presentations**: Fullscreen for demos
- **Quick Reviews**: Preview mode for inspection

The VS Code-like view switcher brings professional IDE functionality to your web application! 🎉