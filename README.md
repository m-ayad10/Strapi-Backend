# Codely Backend - Strapi Integration

This is the backend proxy service that connects the frontend to the Strapi v5 CMS. It handles API requests, media uploads, and data validation.

## Prerequisites
- Node.js (v18 or higher recommended)
- Strapi v5 instance running (default: http://localhost:1337)

## Setup Instructions

### 1. Install Dependencies
Install the required packages using npm:
```bash
npm install
```

### 2. Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(Or manually create a `.env` file in the root directory)*

2. Open `.env` and configure your Strapi credentials:
   ```env
   PORT=3000
   STRAPI_URL=http://localhost:1337
   STRAPI_TOKEN=your_full_access_api_token_from_strapi_dashboard
   ```
   > **Note:** To generate a `STRAPI_TOKEN`, go to your Strapi Dashboard -> Settings -> API Tokens -> Create a new token with **Full Access**.

### 3. Run the Application
Start the development server:
```bash
npm run dev
```
The server will start on `http://localhost:3000` (or your configured PORT).

## Project Structure
- `src/config`: Configuration settings.
- `src/controllers`: Request handlers.
- `src/services`: Business logic and Strapi API interactions.
- `src/routes`: API route definitions.
- `src/utils`: Helper functions.

## API Documentation
See `walkthrough.md` in the documentation folder for detailed API usage, especially for the Sections Dynamic Zone features.
