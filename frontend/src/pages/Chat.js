import React, { useState, useEffect, useContext } from 'react';
import { SocketContext, useSocket } from '../contexts/SocketContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Paper,
  Divider,
  Badge,
  Chip,
  IconButton
} from '@mui/material';
import { Send, Circle } from '@mui/icons-material';
import axios from 'axios';

// Chat component with private messaging - Fixed version
const Chat = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Usar el socket del contexto
  const { socket, messages: contextMessages, onlineUsers: contextOnlineUsers } = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decodificar el token para obtener el usuario actual
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({ 
        id: payload.userId, 
        userId: payload.userId,
        email: payload.email,
        username: payload.username || payload.email 
      });
    }
  }, []);

  // Sincronizar usuarios en línea del contexto
  useEffect(() => {
    if (contextOnlineUsers && Array.isArray(contextOnlineUsers)) {
      setOnlineUsers(contextOnlineUsers);
    }
  }, [contextOnlineUsers]);

  // Configurar eventos del socket específicos para el chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (activeConversation && message.roomId === activeConversation.id) {
        setMessages(prev => {
          // Verificar si el mensaje ya existe para evitar duplicados
          const exists = prev.some(msg => msg.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    // fetchOnlineUsers(); // Ya no es necesario, vienen del contexto
    fetchConversations();
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/chat/users/online', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Asegurar que la respuesta sea un array
      const users = Array.isArray(response.data) ? response.data : [];
      setOnlineUsers(users);
    } catch (error) {
      console.error('Error fetching online users:', error);
      // En caso de error, establecer como array vacío
      setOnlineUsers([]);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Asegurar que la respuesta sea un array
      const conversations = Array.isArray(response.data) ? response.data : [];
      setConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // En caso de error, establecer como array vacío
      setConversations([]);
    }
  };

  const startConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/chat/users/${userId}/chat`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const conversation = response.data;
      // Normalizar el objeto conversation para que tenga un campo id
      const normalizedConversation = {
        ...conversation,
        id: conversation.roomId || conversation.id
      };
      setActiveConversation(normalizedConversation);
      
      // Actualizar conversaciones
      setConversations(prev => {
        const existing = prev.find(c => c.id === normalizedConversation.id);
        if (existing) {
          return prev;
        }
        return [...prev, normalizedConversation];
      });

      // Cargar mensajes de la conversación
      loadMessages(normalizedConversation.id);
      
      // Unirse a la sala usando Socket.IO
      if (socket) {
        socket.emit('join-room', normalizedConversation.id);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/chat/rooms/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Asegurar que la respuesta sea un array
      const messagesData = Array.isArray(response.data) ? response.data : [];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !socket) return;

    try {
      console.log('Enviando mensaje:', {
        roomId: activeConversation.id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      // Enviar mensaje usando Socket.IO
      socket.emit('send-message', {
        roomId: activeConversation.id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
    
    // Unirse a la sala usando Socket.IO
    if (socket) {
      socket.emit('join-room', conversation.id);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !currentUser) return null;
    
    // Si la conversación tiene un campo otherUser (viene del endpoint /conversations)
    if (conversation.otherUser) {
      return conversation.otherUser;
    }
    
    // Si la conversación tiene participants (viene del endpoint /users/:userId/chat)
    if (conversation.participants && Array.isArray(conversation.participants)) {
      return conversation.participants.find(p => p.userId !== currentUser.userId);
    }
    
    return null;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chat Privado
      </Typography>
      
      <Grid container spacing={3} sx={{ height: '80vh' }}>
        {/* Panel izquierdo - Usuarios en línea y conversaciones */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Usuarios en línea */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Usuarios en línea
                  </Typography>
                  <List>
                    {Array.isArray(onlineUsers) && onlineUsers.map((user) => (
                      <ListItem 
                        key={user.userId || user.id} 
                        button 
                        onClick={() => startConversation(user.userId || user.id)}
                        sx={{ 
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                            }
                          >
                            <Avatar>
                              {user.username ? user.username[0].toUpperCase() : 'U'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.username || 'Usuario'}
                          secondary="En línea"
                        />
                      </ListItem>
                    ))}
                    {onlineUsers.length === 0 && (
                      <ListItem>
                        <ListItemText 
                          primary="No hay usuarios en línea"
                          secondary="Serás visible cuando otros usuarios se conecten"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Conversaciones activas */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conversaciones
                  </Typography>
                  <List>
                    {Array.isArray(conversations) && conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      return (
                        <ListItem 
                          key={conversation.id} 
                          button
                          selected={activeConversation?.id === conversation.id}
                          onClick={() => selectConversation(conversation)}
                          sx={{ 
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {otherUser ? (otherUser.username || otherUser.email || 'U')[0].toUpperCase() : 'C'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={otherUser?.username || otherUser?.email || 'Conversación'}
                            secondary={typeof conversation.lastMessage === 'string' ? conversation.lastMessage : 'Iniciar conversación'}
                          />
                        </ListItem>
                      );
                    })}
                    {conversations.length === 0 && (
                      <ListItem>
                        <ListItemText 
                          primary="No hay conversaciones"
                          secondary="Haz click en un usuario para iniciar una conversación"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Panel derecho - Chat */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {activeConversation ? (
              <>
                {/* Header del chat */}
                <CardContent sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {getOtherUser(activeConversation)?.email || getOtherUser(activeConversation)?.username || 'Chat'}
                  </Typography>
                  <Chip 
                    label="En línea" 
                    color="success" 
                    size="small"
                    icon={<Circle sx={{ fontSize: 12 }} />}
                  />
                </CardContent>

                {/* Mensajes */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {Array.isArray(messages) && messages.map((message) => (
                    <Paper 
                      key={message._id || message.id} 
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        maxWidth: '70%',
                        alignSelf: message.senderId === currentUser?.id ? 'flex-end' : 'flex-start',
                        ml: message.senderId === currentUser?.id ? 'auto' : 0,
                        mr: message.senderId === currentUser?.id ? 0 : 'auto',
                        backgroundColor: message.senderId === currentUser?.id ? 'primary.light' : 'grey.100'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {typeof message.senderUsername === 'string' ? message.senderUsername : 
                         (message.senderUsername?.username || message.senderUsername?.email || 'Usuario')}
                      </Typography>
                      <Typography variant="body1">
                        {typeof message.content === 'string' ? message.content : 'Mensaje'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                {/* Input para escribir mensaje */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      variant="outlined"
                      size="small"
                    />
                    <IconButton 
                      color="primary" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Selecciona un usuario para iniciar una conversación
                </Typography>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat;
