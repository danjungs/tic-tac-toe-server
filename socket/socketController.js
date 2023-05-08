import { Server } from 'socket.io';

export const appIO = (server) => {
  const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
    }
  })

  const rooms = [];

  io.on('connection', (socket) => {
    const { id } = socket;
    console.log('Usuario conectado ', id);

    socket.on('join_room', data => {
        const { username, room } = data;
        if(!username || !room ) {
            return;
        }

        const roomInfo = getRoomInfo(room);

        // Start the game
        if (roomInfo && roomInfo.players.length < 2) {
          socket.join(room);
          console.log(username, 'entrou na sala: ', room)
          const newPlayer = {
            username,
            symbol: 'O'
          }
          roomInfo.players.push(newPlayer);
          io.in(room).emit('begin_game', roomInfo.players);
          return;
        }

        // Room full
        if (roomInfo) {
          console.log(room, 'está cheia')
          socket.emit('room_full');
          return;
        }

        // Creating room
        console.log('Criando sala: ', room)
        const newRoom = {
          id: room,
          players: []
        }
        const player = {
          username,
          symbol: 'X'
        }
        newRoom.players.push(player);
        rooms.push(newRoom);
        socket.join(room);
        console.log('Sala criada: ', newRoom)
    })

    socket.on('make_move', data => {
      const { room } = data;

      // TODO: VALIDATE MOVE      

      io.in(room).emit('move_made', data);
    })

    socket.on('reset_request', data => {
      const { room, symbol } = data;
      if (!room || !symbol) {
        return;
      }
      const roomInfo = getRoomInfo(room);
      if (!roomInfo) {
        return;
      }
      const { resetRequest }  = roomInfo
      if (resetRequest && resetRequest != symbol) {
        delete roomInfo.resetRequest;
        io.in(room).emit('reset_game', roomInfo);
        return;
      }
      roomInfo.resetRequest = symbol;
    })
  });

  const getRoomInfo = (room) => {
    return rooms.find(el => el.id === room)
  }

}