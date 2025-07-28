# 📁 VS Code-like File Explorer

A comprehensive file explorer component with tree view, syntax highlighting, and file management capabilities.

## 🚀 Features

### 📂 File Tree Explorer
- **Hierarchical Tree View**: Expandable/collapsible folder structure
- **File Type Icons**: Different icons for JavaScript, JSON, Markdown, etc.
- **Current File Highlighting**: Shows which file is currently selected
- **File Size Display**: Shows file sizes for better organization
- **Context Menu**: Right-click for file operations

### 📝 File Viewer
- **Syntax Highlighting**: Code highlighting for multiple languages
- **Edit Mode**: In-place editing with save functionality
- **Multiple Tabs**: Content, Preview, and Test Info tabs
- **File Operations**: Copy, download, run tests
- **Breadcrumb Navigation**: Shows current file path

### 🎛️ View Modes
- **Split View**: Explorer + Viewer side by side
- **Explorer Only**: Full-width file tree
- **Viewer Only**: Full-width file content

## 🛠️ Components

### FileExplorer.js
```javascript
// Main tree view component
<FileExplorer
  onFileSelect={handleFileSelect}
  currentFile={selectedFile}
  onRefresh={handleRefresh}
/>
```

### FileViewer.js
```javascript
// File content viewer with editing
<FileViewer
  file={selectedFile}
  onClose={handleFileClose}
  onSave={handleFileSave}
/>
```

### Explorer.js
```javascript
// Main page combining both components
<Explorer />
```

## 🎯 Usage

1. **Navigate to Explorer**: Click "📁 Explorer" in the navigation
2. **Browse Files**: Click folders to expand/collapse
3. **Select Files**: Click on any file to view its content
4. **Edit Files**: Click the edit button to modify content
5. **Save Changes**: Use the save button to persist changes

## 🔧 API Endpoints

The file explorer uses these backend endpoints:

- `GET /api/files/tree` - Get file tree structure
- `GET /api/files/content?path=...` - Get file content
- `POST /api/files/save` - Save file content
- `POST /api/files/create` - Create new file/folder
- `DELETE /api/files/delete` - Delete file/folder

## 🎨 Features Showcase

### Tree View
- ✅ Folder expand/collapse with icons
- ✅ File type recognition and icons
- ✅ Current file highlighting
- ✅ File size display
- ✅ Context menu operations

### File Viewer
- ✅ Syntax highlighting (JavaScript, JSON, Markdown, etc.)
- ✅ Edit mode with save functionality
- ✅ Multiple view tabs (Content, Preview, Test Info)
- ✅ File operations (copy, download, run)
- ✅ Breadcrumb navigation

### Integration
- ✅ Integrated with existing React app
- ✅ Material-UI components
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## 🚀 Getting Started

The file explorer is already integrated into your promptAutoTest application:

1. Start the application:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:4001/explorer

3. Explore your project files with the VS Code-like interface!

## 📋 File Types Supported

- **JavaScript/JSX**: `.js`, `.jsx` files with syntax highlighting
- **JSON**: `.json` files with formatted display
- **Markdown**: `.md` files with preview capability
- **Configuration**: `.env`, `.config` files
- **Test Files**: `.test.js`, `.spec.js` with special test actions
- **Feature Files**: `.feature` files for BDD tests

## 🎯 Perfect for

- **Code Review**: Browse and examine project files
- **Quick Edits**: Make small changes without leaving the browser
- **Test Management**: View and run test files
- **Project Navigation**: Understand project structure
- **File Organization**: Create, delete, and manage files

This file explorer brings the familiar VS Code experience directly to your web application! 🎉