# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm install` to install dependencies
- Start: `npm start` to start the development server
- No tests are currently configured

## Code Style
- **Formatting**: 2-space indentation, double quotes
- **Modules**: ES modules syntax with import/export
- **Naming**: camelCase for variables/functions, PascalCase for classes/models
- **Files**: Controllers use {resource}.controllers.js, models use {resource}.models.js
- **Error Handling**: Use ApiError class with appropriate status codes
- **Responses**: Format all responses with ApiResponse class
- **Async**: Wrap all async controller functions with asyncHandler
- **Validation**: Use express-validator middleware for input validation

## Documentation
- Add JSDoc-style comments for functions and important code blocks
- Include comments for complex logic