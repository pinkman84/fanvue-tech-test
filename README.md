# Fanvue Tech Test

## Overview
Simple messaging application with a Node.js API and a React (Next.js) frontend.
Supports large threads (20k+ messages), pagination, virtualised rendering, and basic CRUD.

## Requirements
- Node 18+

## Running locally

### API
cd api
npm install
npm run dev

Runs on http://localhost:4000

### Web
cd web
npm install
npm run dev

Runs on http://localhost:3000

---


### Using the app

Once the application is running, you will see a list of available threads in the left-hand panel. Threads can be filtered using the search input, or selected directly from the list.

Selecting a thread displays its messages in the main panel on the right. Messages are loaded incrementally as you scroll upwards through the history.

You can reply to a thread using the input field at the bottom of the message pane. A message can be sent either by clicking the **Send** button or by pressing **Enter**. Once sent, the new message appears in the list with its content and timestamp, and the view automatically scrolls to show the latest message.