import { useEffect, useState, useRef } from 'react';
import React from 'react';
import io from 'socket.io-client';
import { produce } from 'immer';
const App = () => {
  const [mySocket, setMySocket] = useState(null);
  const [roomIdToMessageMapping, setRoomIdToMessageMapping] = useState({})
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState('');
  const isPromptShown = useRef(false);


  useEffect(() => {
    if (isPromptShown.current === false) {
      isPromptShown.current = true;
      while (true) {
        const validUsername = prompt('What is your Username?');
        if (validUsername !== null && validUsername?.trim()) {
          setUsername(validUsername);
          console.log(username);
          break;
        }
      }
    }
    const socket = io('ws://localhost:3001', {
      transports: ['websocket']
    });

    setMySocket(socket);

    socket.on('roomMessage', (data) => {
      const { roomId, message, username, messageId } = data;
      console.log(`Received the message '${message}' with id: ${messageId} for the room ${roomId}`);
      setRoomIdToMessageMapping(produce(state => {
        state[roomId] = state[roomId] || [];
        if (!state[data.roomId].some(obj => obj.messageId === messageId)) {
          state[data.roomId].push(data);
        }
      }));
    })

    socket.on('server-sending-indicator', (message) => {
      setTypingIndicator(message);
    })
    // Cleanup function
    return () => {
      if (socket && socket.connected) {
        socket.close();
      }
    };
  }, []);

  if (mySocket == null) {
    return null
  }

  const joinRoomExclusively = (roomId) => {
    if (mySocket == null) return null
    mySocket.emit('joinRoomExclusively', roomId);
    mySocket.on('success-joining-room', (message) => {
      console.log(message);
      setActiveRoom(roomId);
      setTypingIndicator('');
    })
    mySocket.on('error-joining-room', (message) => {
      console.log(message);
    })
  }

  const sendMessage = (e) => {
    if (mySocket == null) return null
    if (activeRoom == null) {
      alert('Please Join a room before sending a message.');
    } else {
      mySocket.emit('sendMessage', { roomId: activeRoom, message: message, username: username });
      setMessage('');
    }
  }

  const sendTypingIndicator = (e) => {
    if (mySocket == null) return null
    if (activeRoom == null) {
      alert('Please Join a room before sending a message.');
    } else {
      mySocket.emit('send-typing-indicator', {roomId: activeRoom, username: username});
    }
  }

  const roomMessages = roomIdToMessageMapping[activeRoom] || []
  return (
    <div className='grid grid-cols-12 divide-x divide-gray-300'>
      <aside className='col-span-2 px-8 h-screen overflow-y-auto'>
        {Array(50)
          .fill(0)
          .map((_, i) => {
            return (
              <div
                className={'p-2 cursor-pointer ' + (activeRoom === i + 1 ? 'bg-gray-600 text-white' : 'hover:bg-gray-100')}
                key={i}
                onClick={() => {
                  joinRoomExclusively(i + 1)
                }}
              >Room #{i + 1}</div>
            )
          })}
      </aside>
      <main className='col-span-10 px-8 h-screen flex flex-col'>
        <b>{`Your username: ${username}`}</b>
        {roomMessages.map(({ username, message }, id) => {
          return (
            <div key={id} className='w-full px-4 py-4'>
              <b>{username}</b>
              <p>{message}</p>
            </div>
          )
        })}
        <div className='flex-grow' />
        <div className="mb-8 flex justify-center items-center gap-2">
          <p>{typingIndicator}</p>
          <textarea
            id="about"
            name="about"
            rows="2"
            value={message}
            onChange={(e) => {
              sendTypingIndicator();
              setMessage(e.target.value)
            }}
            onBlur={(e) => {
              setTypingIndicator('');
            }}
            className="block flex-grow mb-8 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
          </textarea>
          <button
            type="submit"
            className="rounded-md flex-shrink bg-indigo-600 px-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={sendMessage}
          >
            Send Message
          </button>

        </div>
      </main>
    </div>
  )
}

export default App;
