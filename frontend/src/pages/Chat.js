import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
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
  IconButton,
  InputAdornment,
  Fade,
  Zoom,
  Alert,
  Skeleton,
} from '@mui/material';
import { 
  Send, 
  Circle, 
  Search,
  EmojiEmotions,
  AttachFile,
  MoreVert,
  PersonAdd,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

const Chat = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { socket, messages: contextMessages, onlineUsers: contextOnlineUsers } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ 
          id: payload.id,
          userId: payload.id,
          email: payload.email,
          username: payload.username || payload.email 
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        setError('Error de autenticación');
      }
    }
  }, []);

  useEffect(() => {
    if (contextOnlineUsers && Array.isArray(contextOnlineUsers)) {
      setOnlineUsers(contextOnlineUsers);
    }
  }, [contextOnlineUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (activeConversation && message.roomId === activeConversation.id) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === message.id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    };

    const handleUserTyping = (data) => {
      if (data.userId !== currentUser?.id) {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, activeConversation, currentUser]);

  useEffect(() => {
    fetchConversations();
    setLoading(false);
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conversations = Array.isArray(response.data) ? response.data : [];
      setConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Error al cargar las conversaciones');
      setConversations([]);
    }
  };

  const startConversation = async (userId) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/chat/users/${userId}/chat`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const conversation = response.data;
      const normalizedConversation = {
        ...conversation,
        id: conversation.roomId || conversation.id
      };
      setActiveConversation(normalizedConversation);
      
      setConversations(prev => {
        const existing = prev.find(c => c.id === normalizedConversation.id);
        if (existing) return prev;
        return [...prev, normalizedConversation];
      });

      loadMessages(normalizedConversation.id);
      
      if (socket) {
        socket.emit('join-room', normalizedConversation.id);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Error al iniciar la conversación');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/chat/rooms/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      socket.emit('send-message', {
        roomId: activeConversation.id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', {
        roomId: activeConversation.id,
        isTyping: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar el mensaje');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (socket && activeConversation) {
      socket.emit('typing', {
        roomId: activeConversation.id,
        isTyping: value.length > 0
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          roomId: activeConversation.id,
          isTyping: false
        });
      }, 1000);
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
    
    if (socket) {
      socket.emit('join-room', conversation.id);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !currentUser) return null;
    
    if (conversation.otherUser) {
      return conversation.otherUser;
    }
    
    if (conversation.participants && Array.isArray(conversation.participants)) {
      return conversation.participants.find(p => p.userId !== currentUser.userId);
    }
    
    return null;
  };

  const filteredOnlineUsers = onlineUsers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Typography 
        variant="h3" 
        gutterBottom
        sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Chat en Tiempo Real
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Panel izquierdo */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Usuarios en línea */}
            <Grid item xs={12} sx={{ height: '50%' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Usuarios en línea ({filteredOnlineUsers.length})
                    </Typography>
                    <IconButton size="small" sx={{ color: 'white' }}>
                      <Refresh />
                    </IconButton>
                  </Box>
                  
                  <TextField
                    size="small"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-focused fieldset': { borderColor: 'white' },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        opacity: 1,
                      },
                    }}
                  />
                  
                  <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {filteredOnlineUsers.length > 0 ? (
                      filteredOnlineUsers.map((user) => (
                        <Fade in key={user.userId || user.id} timeout={300}>
                          <Card
                            sx={{
                              mb: 1,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                transform: 'translateX(8px)',
                              }
                            }}
                            onClick={() => startConversation(user.userId || user.id)}
                          >
                            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  badgeContent={
                                    <Circle sx={{ color: '#4caf50', fontSize: 12 }} />
                                  }
                                >
                                  <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                                    {user.username ? user.username[0].toUpperCase() : 'U'}
                                  </Avatar>
                                </Badge>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ color: 'text.primary', fontWeight: 600 }}
                                  >
                                    {user.username || 'Usuario'}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ color: 'success.main', fontWeight: 500 }}
                                  >
                                    En línea
                                  </Typography>
                                </Box>
                                <IconButton size="small" sx={{ color: 'primary.main' }}>
                                  <PersonAdd />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Fade>
                      ))
                    ) : (
                      <Card sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios en línea'}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Conversaciones activas */}
            <Grid item xs={12} sx={{ height: '50%' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Conversaciones ({conversations.length})
                  </Typography>
                  <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {conversations.length > 0 ? (
                      conversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        const isActive = activeConversation?.id === conversation.id;
                        return (
                          <Zoom in key={conversation.id} timeout={300}>
                            <Card
                              sx={{
                                mb: 1,
                                cursor: 'pointer',
                                backgroundColor: isActive ? 'primary.light' : 'background.paper',
                                border: isActive ? 2 : 1,
                                borderColor: isActive ? 'primary.main' : 'divider',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: isActive ? 'primary.light' : 'action.hover',
                                  transform: 'translateY(-2px)',
                                  boxShadow: 2,
                                }
                              }}
                              onClick={() => selectConversation(conversation)}
                            >
                              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                                    {otherUser ? (otherUser.username || otherUser.email || 'U')[0].toUpperCase() : 'C'}
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography 
                                      variant="subtitle2" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color: isActive ? 'primary.contrastText' : 'text.primary'
                                      }}
                                      noWrap
                                    >
                                      {otherUser?.username || otherUser?.email || 'Conversación'}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: isActive ? 'primary.contrastText' : 'text.secondary'
                                      }}
                                      noWrap
                                    >
                                      {typeof conversation.lastMessage === 'string' 
                                        ? conversation.lastMessage 
                                        : 'Iniciar conversación'
                                      }
                                    </Typography>
                                  </Box>
                                  <IconButton size="small">
                                    <MoreVert />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        );
                      })
                    ) : (
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No hay conversaciones
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Haz click en un usuario para iniciar una conversación
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Panel derecho - Chat */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: 3,
            }}
          >
            {activeConversation ? (
              <>
                {/* Header del chat */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                        {getOtherUser(activeConversation)?.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {getOtherUser(activeConversation)?.username || 
                           getOtherUser(activeConversation)?.email || 'Chat'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Circle sx={{ fontSize: 12, mr: 0.5, color: '#4caf50' }} />
                          <Typography variant="caption">
                            En línea
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton sx={{ color: 'white' }}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                {/* Mensajes */}
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    p: 2,
                    backgroundColor: '#f8fafc',
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                >
                  {messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isOwnMessage = message.senderId === currentUser?.id;
                      const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                      
                      return (
                        <Fade in key={message._id || message.id} timeout={300}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                              mb: 1,
                              alignItems: 'flex-end'
                            }}
                          >
                            {!isOwnMessage && showAvatar && (
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1,
                                  bgcolor: 'primary.main'
                                }}
                              >
                                {message.senderUsername?.[0]?.toUpperCase() || 'U'}
                              </Avatar>
                            )}
                            {!isOwnMessage && !showAvatar && (
                              <Box sx={{ width: 32, mr: 1 }} />
                            )}
                            
                            <Paper
                              elevation={2}
                              sx={{
                                p: 1.5,
                                maxWidth: '70%',
                                backgroundColor: isOwnMessage ? 'primary.main' : 'white',
                                color: isOwnMessage ? 'white' : 'text.primary',
                                borderRadius: 2,
                                borderBottomRightRadius: isOwnMessage ? 4 : 16,
                                borderBottomLeftRadius: isOwnMessage ? 16 : 4,
                                position: 'relative',
                                '&::before': isOwnMessage ? {} : {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: -8,
                                  width: 0,
                                  height: 0,
                                  borderLeft: '8px solid transparent',
                                  borderRight: '8px solid white',
                                  borderBottom: '8px solid white',
                                }
                              }}
                            >
                              {!isOwnMessage && showAvatar && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    display: 'block',
                                    mb: 0.5
                                  }}
                                >
                                  {message.senderUsername || 'Usuario'}
                                </Typography>
                              )}
                              <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                {message.content}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                  display: 'block',
                                  textAlign: 'right',
                                  mt: 0.5
                                }}
                              >
                                {formatTime(message.createdAt)}
                              </Typography>
                            </Paper>
                          </Box>
                        </Fade>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        ¡Inicia la conversación!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Envía tu primer mensaje para comenzar a chatear
                      </Typography>
                    </Box>
                  )}
                  
                  {isTyping && (
                    <Fade in>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'grey.400' }}>
                          <EmojiEmotions />
                        </Avatar>
                        <Paper
                          sx={{
                            p: 1.5,
                            backgroundColor: 'grey.100',
                            borderRadius: 2,
                            borderBottomLeftRadius: 4,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Escribiendo...
                          </Typography>
                        </Paper>
                      </Box>
                    </Fade>
                  )}
                  
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input para escribir mensaje */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    backgroundColor: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <IconButton color="primary">
                      <AttachFile />
                    </IconButton>
                    <IconButton color="primary">
                      <EmojiEmotions />
                    </IconButton>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: '#f8fafc',
                        }
                      }}
                    />
                    <IconButton 
                      color="primary" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        backgroundColor: newMessage.trim() ? 'primary.main' : 'grey.300',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: newMessage.trim() ? 'primary.dark' : 'grey.400',
                        },
                        '&:disabled': {
                          backgroundColor: 'grey.300',
                          color: 'grey.500',
                        }
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  p: 4
                }}
              >
                <Box>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    <Send sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Selecciona una conversación
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Elige un usuario de la lista para iniciar una conversación
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat;