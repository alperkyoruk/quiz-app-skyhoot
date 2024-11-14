import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const JoinGame = () => {
    const [gameCode, setGameCode] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    

    const handleJoinGame = async (e) => {
        e.preventDefault();
      
        try {
          // Fetch Game Details
          const gameResponse = await axios.get(`http://localhost:8080/api/games/getGameId?gameCode=${gameCode}`);
      
          if (!gameResponse.data.success) {
            setErrorMessage('Failed to retrieve game details.');
            return;
          }
      
          const gameData = gameResponse.data.data;
      
          // Create Player
          const createPlayerDto = {
            playerName: username,
            gameCode: gameCode,
          };
      
          const playerResponse = await axios.post('http://localhost:8080/api/games/connectPlayer', createPlayerDto);
      
          if (playerResponse.status === 200) {
            alert('Player has joined the game successfully');
            const playerId = playerResponse.data.playerId;
            Cookies.set('playerId', playerId, { expires: 1, secure: true, sameSite: 'Strict' }); // Store the player ID in a cookie
            router.push(`/game/${gameData.gameId}`); // Route to the game page
          } else {
            setErrorMessage(playerResponse.data.message); // Display error message
          }
        } catch (error) {
          console.error('Error joining game:', error);
          setErrorMessage('An error occurred while trying to join the game.');
        }
      };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 text-white flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-3xl font-bold text-blue-800 mb-6">Join a Game</h2>
                <form onSubmit={handleJoinGame}>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Game Code"
                            value={gameCode}
                            onChange={(e) => setGameCode(e.target.value)}
                            className="w-full p-3 rounded-md border border-gray-300 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded-md border border-gray-300 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            required
                        />
                    </div>
                    {errorMessage && (
                        <div className="text-red-500 mb-4">{errorMessage}</div>
                    )}
                    <button
                        type="submit"
                        className="bg-yellow-400 text-blue-800 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition duration-300"
                    >
                        Join Game
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinGame;
