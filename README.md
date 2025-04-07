# Chronicle Backend

A real-time collaborative storytelling game backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO

## 📋 Overview

Chronicle is a multiplayer game where players take turns contributing to a story. Each round, players submit text fragments, vote on their favorites, and collectively build a unique narrative. The backend handles game state management, real-time updates, user authentication, and data persistence.

## 🚀 Features

- Real-time Gameplay: Utilizes Socket.IO for instant updates and interactions
- User Authentication: Secure Firebase authentication integration
- Game Management: Create, join, and manage storytelling games
- Voting System: Vote on story fragments to determine the narrative direction
- Persistent Storage: MongoDB integration for saving game states and user data
- RESTful API: Comprehensive API for game and user management

## 🛠️ Tech Stack

- Node.js: JavaScript runtime
- Express: Web framework
- TypeScript: Type-safe JavaScript
- MongoDB: NoSQL database for data persistence
- Socket.IO: Real-time bidirectional event-based communication
- Firebase Admin: Authentication and user management
- Mongoose: MongoDB object modeling
- Joi: Data validation

## 📂 Installation & Project Structure

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)
- Firebase project with service account

Environment Variables
Create a `.env` file in the root directory with the following variables:

```dotenv
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_IOS_BUNDLE_ID=your_ios_bundle_id
```

### Installation

```sh
git clone https://github.com/trillionclues/chronicle-backend.git
cd chronicle-backend
```

    ```sh
    npm install
    ```

    ```sh
    npm run build
    ```

    ```sh
    npm start
    ```

## 🎮 Game Flow

- Game Creation: A user creates a game with specific settings (rounds, time limits, etc.)
- Joining: Other players join using a unique game code
- Writing Phase: Each player submits a text fragment within the time limit
- Voting Phase: Players vote on their favorite submissions
- Results: The winning fragment is added to the story
- Repeat: The process continues for the specified number of rounds
- Completion: The final collaborative story is displayed

## 📡 API Structure

Authentication

- POST /api/auth/login: Login with Google

Games

- `POST /api/games/create`: Create a new game
- `GET /api/games/user-games`: Get user's games
- `POST /api/games/:gameId/join`: Join a game
- `GET /api/games/:gameId`: Get game details
- `GET /api/games/check/:gameCode`: Check if a game code is valid

### 🔌 Socket Events

Client to Server
`joinGame`: Join a game room
`joinGameByCode`: Join a game using a code
`startGame`: Start a game (creator only)
`submitText`: Submit text during writing phase
`submitVote`: Submit vote during voting phase
`leaveGame`: Leave a game
`kickParticipant`: Remove a participant (creator only)
`cancelGame`: Cancel a game (creator only)
`manualNextPhase`: Force next phase (creator only)

Server to Client
`gameStateUpdate`: Updated game state
`joined`: Confirmation of joining a game
`error`: Error messages
`kicked`: Notification of being removed from a game
`leftGame`: Confirmation of leaving a game
`gameEnded`: Notification that a game has ended

## 🚀 Deployment

The application can be deployed to platforms like Render, Heroku, or AWS:

1. Set up environment variables on the deployment platform
2. Configure build command: npm run build
3. Configure start command: npm start

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Socket.IO](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Firebase](https://firebase.google.com/)

## Contact

For any inquiries, please contact us at [support@chronicle.com](mailto:exceln646@gmail.com).
