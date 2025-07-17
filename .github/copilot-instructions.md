<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Photo Sharing Website

This is a Node.js photo upload and gallery website project using Express, Multer, and EJS.

## Project Structure
- `server.js` - Main Express server with photo upload/delete APIs
- `views/index.ejs` - Main template with gallery and upload interface
- `uploads/` - Directory for storing uploaded photos
- `public/` - Static assets (CSS, JS, images)

## Key Technologies
- **Backend**: Node.js, Express, Multer (file uploads), EJS (templating)
- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript
- **Features**: Drag & drop upload, responsive gallery, image preview modal

## Code Style Preferences
- Use modern ES6+ JavaScript features
- Implement responsive design with mobile-first approach
- Add comprehensive error handling for file operations
- Use semantic HTML and accessible design patterns
- Include proper form validation and user feedback

## Common Tasks
- File upload handling with size/type validation
- Image gallery rendering with metadata
- Responsive grid layout implementation
- Modal dialogs for image preview
- CRUD operations for photo management

## Security Considerations
- Validate file types and sizes
- Sanitize file names
- Implement proper error handling
- Use secure file storage practices
