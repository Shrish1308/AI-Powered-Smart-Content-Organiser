import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  FlatList, 
  Dimensions, 
  SafeAreaView, 
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShareIntent } from 'expo-share-intent';
import { AuthContext } from '../context/AuthContext';

// FastAPI Backend URL - change if running on a physical mobile device
const API_BASE_URL = 'http://localhost:8000';

// Shimmer Placeholders for Loading Animation
const AnimatedShimmerLine = ({ width = '100%', height = 14, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

export default function HomeScreen() {
  const { signOut, userToken, username } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState('Checking...');
  const [systemMode, setSystemMode] = useState('');
  
  // Note inputs
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState({ text: '', type: '' });
  
  // Search inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Chat inputs
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', message: 'Hello! I am SmartRecall. Ask me anything about your saved notes, or request a summary!' }
  ]);
  const [chatting, setChatting] = useState(false);
  
  // Weekly Digest
  const [weeklyDigest, setWeeklyDigest] = useState('');
  const [fetchingDigest, setFetchingDigest] = useState(false);
  const [digestExpanded, setDigestExpanded] = useState(false);
  
  // Detail Overlay
  const [selectedNote, setSelectedNote] = useState(null);
  const [relatedNotes, setRelatedNotes] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOrbitNote, setSelectedOrbitNote] = useState(null);

  // Share Intent states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareText, setShareText] = useState('');
  const [shareSaving, setShareSaving] = useState(false);

  // Expo Share Intent Hook
  let shareIntentResult = { hasShareIntent: false, shareIntent: null, resetShareIntent: () => {}, error: null };
  try {
    shareIntentResult = useShareIntent();
  } catch (e) {
    console.log("Share intent hook error:", e);
  }
  const { hasShareIntent, shareIntent, resetShareIntent } = shareIntentResult;

  useEffect(() => {
    if (hasShareIntent && shareIntent && shareIntent.value) {
      setShareText(shareIntent.value);
      setShareModalVisible(true);
    }
  }, [hasShareIntent, shareIntent]);

  useEffect(() => {
    checkBackendHealth();
    fetchNotes();
    fetchReminders();
    fetchWeeklyDigest();
  }, [userToken]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();
      setSystemStatus('Online');
      setSystemMode(data.mode || '');
    } catch (error) {
      setSystemStatus('Offline (Start backend)');
      setSystemMode('No connection');
    }
  };

  const fetchNotes = async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        signOut();
        return;
      }
      setNotes(data);
    } catch (error) {
      console.log('Error fetching notes (fallback to offline mock):', error);
      // Fallback offline mock notes
      setNotes([
        { id: 101, content: 'Remember to read implementation_plan.md', category: 'Study', tags: ['documentation'], created_at: '2026-06-14 10:00:00' },
        { id: 102, content: 'Frontend authentication design tasks list', category: 'Work', tags: ['auth'], created_at: '2026-06-14 11:30:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    if (!userToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/reminders`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        signOut();
        return;
      }
      setReminders(data);
    } catch (error) {
      console.log('Error fetching reminders (offline mode):', error);
      setReminders([
        { id: 201, message: 'Complete frontend auth tasks', reminder_date: '2026-06-15', status: 'pending', note_category: 'Work' }
      ]);
    }
  };

  const fetchWeeklyDigest = async () => {
    if (!userToken) return;
    setFetchingDigest(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/summary/weekly`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (response.status === 401) {
        signOut();
        return;
      }
      setWeeklyDigest(data.summary || '');
    } catch (error) {
      setWeeklyDigest('Offline mode: Backend is not connected. Start uvicorn to generate weekly summaries.');
    } finally {
      setFetchingDigest(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    setNoteMessage({ text: '', type: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ content: noteContent })
      });
      const data = await response.json();
      
      if (data.success) {
        setNoteContent('');
        let successMsg = `Note saved! Auto-classified as "${data.note.category}".`;
        if (data.reminder_scheduled) {
          successMsg += ` Scheduled reminder for ${data.reminder_date}.`;
        }
        setNoteMessage({ text: successMsg, type: 'success' });
        fetchNotes();
        fetchReminders();
        fetchWeeklyDigest();
      } else {
        setNoteMessage({ text: 'Failed to save note.', type: 'error' });
      }
    } catch (error) {
      // Local fallback save simulation
      const mockNewNote = {
        id: Math.floor(Math.random() * 1000),
        content: noteContent,
        category: 'Personal',
        tags: ['local'],
        created_at: '2026-06-14 12:00:00'
      };
      setNotes([mockNewNote, ...notes]);
      setNoteContent('');
      setNoteMessage({ text: 'Note saved locally (Backend Offline).', type: 'success' });
    } finally {
      setSavingNote(false);
      setTimeout(() => setNoteMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (data.success) {
        if (selectedNote && selectedNote.id === id) {
          setSelectedNote(null);
        }
        fetchNotes();
        fetchReminders();
        fetchWeeklyDigest();
      }
    } catch (error) {
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      // Simple frontend filtering as local search fallback
      const filtered = notes.filter(n => 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(n => ({ ...n, similarity: 0.8 }));
      setSearchResults(filtered);
    } finally {
      setSearching(false);
    }
  };

  const handleSendChatMessage = async (presetText = null) => {
    const textToSend = presetText || chatQuery;
    if (!textToSend.trim()) return;
    
    const updatedHistory = [...chatHistory, { sender: 'user', message: textToSend }];
    setChatHistory(updatedHistory);
    setChatQuery('');
    setChatting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await response.json();
      setChatHistory([...updatedHistory, { sender: 'ai', message: data.answer }]);
    } catch (error) {
      setChatHistory([...updatedHistory, { sender: 'ai', message: 'Offline mode: Ask me anything. Start backend server for Gemini RAG replies.' }]);
    } finally {
      setChatting(false);
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reminders/${reminderId}/complete`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchReminders();
      }
    } catch (error) {
      setReminders(reminders.map(r => r.id === reminderId ? { ...r, status: 'completed' } : r));
    }
  };

  const handleViewNoteDetails = async (note) => {
    setSelectedNote(note);
    setRelatedNotes([]);
    setLoadingRelated(true);
    setSelectedOrbitNote(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ query: note.summary || note.content })
      });
      const data = await response.json();
      if (response.status === 401) {
        signOut();
        return;
      }
      const filtered = data.filter(n => n.id !== note.id);
      setRelatedNotes(filtered);
      if (filtered.length > 0) {
        setSelectedOrbitNote(filtered[0]);
      }
    } catch (error) {
      // Offline fallback related notes
      const filtered = notes.filter(n => n.id !== note.id).map(n => ({ ...n, similarity: 0.75 }));
      setRelatedNotes(filtered);
      if (filtered.length > 0) {
        setSelectedOrbitNote(filtered[0]);
      }
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleSaveSharedContent = async () => {
    if (!shareText.trim()) return;
    setShareSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ content: shareText })
      });
      const data = await response.json();
      if (data.success) {
        setShareText('');
        setShareModalVisible(false);
        resetShareIntent();
        fetchNotes();
        fetchReminders();
        fetchWeeklyDigest();
        setNoteMessage({
          text: `Shared note saved under category "${data.note.category}"!`,
          type: 'success'
        });
        setTimeout(() => setNoteMessage({ text: '', type: '' }), 5000);
      } else {
        alert('Failed to save shared content.');
      }
    } catch (e) {
      // Local fallback save simulation
      const mockNewNote = {
        id: Math.floor(Math.random() * 1000),
        content: shareText,
        category: 'Other',
        tags: ['shared'],
        created_at: '2026-06-14 12:00:00'
      };
      setNotes([mockNewNote, ...notes]);
      setShareText('');
      setShareModalVisible(false);
      resetShareIntent();
      setNoteMessage({ text: 'Shared content saved locally (Offline).', type: 'success' });
      setTimeout(() => setNoteMessage({ text: '', type: '' }), 5000);
    } finally {
      setShareSaving(false);
    }
  };

  const handleCancelShare = () => {
    setShareText('');
    setShareModalVisible(false);
    resetShareIntent();
  };

  const AIResponseShimmer = () => (
    <View style={[styles.chatBubble, styles.aiBubble, { width: '85%' }]}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={12} color="#8b5cf6" />
      </View>
      <View style={[styles.aiTextContainer, { flex: 1, paddingVertical: 14, gap: 8 }]}>
        <AnimatedShimmerLine width="90%" />
        <AnimatedShimmerLine width="75%" />
        <AnimatedShimmerLine width="45%" style={{ marginBottom: 2 }} />
      </View>
    </View>
  );

  const renderSemanticOrbit = () => {
    if (loadingRelated) {
      return <ActivityIndicator size="small" color="#8b5cf6" style={{ marginVertical: 20 }} />;
    }
    if (relatedNotes.length === 0) {
      return <Text style={styles.relatedPlaceholder}>No semantically close notes found.</Text>;
    }

    const angles = [-Math.PI / 4, -3 * Math.PI / 4, Math.PI / 2];

    return (
      <View style={styles.orbitWrapper}>
        <View style={styles.orbitContainer}>
          <View style={styles.orbitCenter}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.orbitCenterText}>Current</Text>
          </View>

          <View style={[styles.orbitGuide, { width: 110, height: 110, borderRadius: 55 }]} />
          <View style={[styles.orbitGuide, { width: 190, height: 190, borderRadius: 95 }]} />

          {relatedNotes.slice(0, 3).map((rn, idx) => {
            const angle = angles[idx % angles.length];
            const similarity = rn.similarity || 0.75;
            const distance = 55 + (1 - similarity) * 80;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            const isSelected = selectedOrbitNote && selectedOrbitNote.id === rn.id;

            return (
              <React.Fragment key={rn.id}>
                <View 
                  style={[
                    styles.orbitLine, 
                    {
                      width: distance,
                      transform: [
                        { translateX: x / 2 },
                        { translateY: y / 2 },
                        { rotate: `${angle}rad` }
                      ]
                    }
                  ]} 
                />

                <View 
                  style={[
                    styles.orbitMatchBadge, 
                    {
                      transform: [
                        { translateX: x / 2 - 22 },
                        { translateY: y / 2 - 8 }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.orbitMatchText}>{Math.round(similarity * 100)}%</Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.orbitSatellite, 
                    isSelected ? styles.orbitSatelliteSelected : {},
                    {
                      transform: [
                        { translateX: x - 16 },
                        { translateY: y - 16 }
                      ]
                    }
                  ]}
                  onPress={() => setSelectedOrbitNote(rn)}
                >
                  <Ionicons 
                    name={
                      rn.category === 'Study' ? 'book' :
                      rn.category === 'Work' ? 'briefcase' :
                      rn.category === 'Health' ? 'heart' :
                      rn.category === 'Finance' ? 'cash' :
                      rn.category === 'Personal' ? 'person' : 'bookmark'
                    } 
                    size={14} 
                    color={isSelected ? '#fff' : '#c084fc'} 
                  />
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {selectedOrbitNote && (
          <View style={styles.orbitPreviewCard}>
            <View style={styles.orbitPreviewHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.noteCategoryBadge}>{selectedOrbitNote.category || 'General'}</Text>
                <Text style={styles.orbitPreviewMatchText}>
                  ({Math.round(selectedOrbitNote.similarity * 100)}% semantic match)
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.orbitFocusButton}
                onPress={() => handleViewNoteDetails(selectedOrbitNote)}
              >
                <Text style={styles.orbitFocusButtonText}>Pivot to Note</Text>
                <Ionicons name="arrow-forward" size={12} color="#c084fc" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            <Text style={styles.orbitPreviewContent} numberOfLines={3}>
              {selectedOrbitNote.content}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render components
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.logoText}>SmartRecall</Text>
        <Text style={styles.subLogoText}>Hello, {username || 'User'}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: systemStatus === 'Online' ? '#10b981' : '#f59e0b' }]} />
          <Text style={styles.statusText}>{systemStatus}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDashboard = () => {
    const pendingReminders = reminders.filter(r => r.status === 'pending');
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Quick Save Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Auto-Organize Note or Link</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type note (e.g. 'Exam on 15th') or paste URL here..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={noteContent}
            onChangeText={setNoteContent}
          />
          <TouchableOpacity 
            style={[styles.primaryButton, noteContent.trim() ? {} : styles.disabledButton]} 
            onPress={handleSaveNote}
            disabled={savingNote || !noteContent.trim()}
          >
            {savingNote ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonText}>Process with Gemini</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {noteMessage.text ? (
            <View style={[styles.messageBox, noteMessage.type === 'success' ? styles.successBox : styles.errorBox]}>
              <Ionicons 
                name={noteMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={16} 
                color={noteMessage.type === 'success' ? '#10b981' : '#f87171'} 
                style={{ marginRight: 6 }}
              />
              <Text style={noteMessage.type === 'success' ? styles.successText : styles.errorText}>
                {noteMessage.text}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Weekly Digest Expandable Card */}
        <View style={styles.glassCard}>
          <TouchableOpacity 
            style={styles.digestHeader} 
            onPress={() => setDigestExpanded(!digestExpanded)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color="#c084fc" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Weekly Summary Digest</Text>
            </View>
            <Ionicons name={digestExpanded ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
          </TouchableOpacity>
          
          {digestExpanded && (
            <View style={styles.digestBody}>
              {fetchingDigest ? (
                <ActivityIndicator color="#8b5cf6" style={{ marginVertical: 10 }} />
              ) : weeklyDigest ? (
                <Text style={styles.digestText}>{weeklyDigest}</Text>
              ) : (
                <Text style={styles.digestPlaceholder}>No summaries available. Start saving notes to generate your weekly report.</Text>
              )}
              <TouchableOpacity style={styles.secondaryButton} onPress={fetchWeeklyDigest}>
                <Text style={styles.secondaryButtonText}>Refresh Digest</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Reminders Card */}
        <View style={styles.glassCard}>
          <View style={styles.digestHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="alarm-outline" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Upcoming Nudges</Text>
            </View>
            <Text style={styles.reminderCountBadge}>{pendingReminders.length}</Text>
          </View>
          
          {pendingReminders.length > 0 ? (
            pendingReminders.slice(0, 3).map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderMsg}>{reminder.message}</Text>
                  <Text style={styles.reminderDate}>Alert scheduled: {reminder.reminder_date}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.checkButton} 
                  onPress={() => handleCompleteReminder(reminder.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No upcoming reminders found. Write a note mentioning a date to trigger a nudge!</Text>
          )}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    );
  };

  const renderLibrary = () => {
    const categories = ['All', 'Study', 'Work', 'Health', 'Finance', 'Personal', 'Other'];
    
    const filteredNotes = selectedCategory === 'All' 
      ? notes 
      : notes.filter(n => n.category === selectedCategory);

    return (
      <View style={styles.tabContent}>
        {/* Categories Scroller */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryChip, selectedCategory === cat ? styles.activeCategoryChip : {}]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat ? styles.activeCategoryChipText : {}]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.noteCard} onPress={() => handleViewNoteDetails(item)}>
                <View style={styles.noteCardHeader}>
                  <Text style={styles.noteCategoryBadge}>{item.category || 'General'}</Text>
                  <Text style={styles.noteDateText}>{item.created_at ? item.created_at.split(' ')[0] : 'Today'}</Text>
                </View>
                <Text style={styles.noteTitle} numberOfLines={2}>{item.content}</Text>
                {item.summary ? (
                  <Text style={styles.noteSummaryText} numberOfLines={2}>{item.summary}</Text>
                ) : null}
                <View style={styles.tagsContainer}>
                  {item.tags && item.tags.map(tag => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#475569" />
            <Text style={styles.emptyStateText}>No notes found in "{selectedCategory}" category.</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSearch = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search notes semantically (e.g. 'python references')..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={searching}>
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.noteCard} onPress={() => handleViewNoteDetails(item)}>
                <View style={styles.noteCardHeader}>
                  <Text style={styles.noteCategoryBadge}>{item.category}</Text>
                  <View style={styles.similarityScoreBadge}>
                    <Ionicons name="analytics" size={12} color="#10b981" style={{ marginRight: 4 }} />
                    <Text style={styles.similarityScoreText}>
                      {Math.round(item.similarity * 100)}% match
                    </Text>
                  </View>
                </View>
                <Text style={styles.noteTitle} numberOfLines={2}>{item.content}</Text>
                {item.summary ? (
                  <Text style={styles.noteSummaryText} numberOfLines={2}>{item.summary}</Text>
                ) : null}
                <View style={styles.tagsContainer}>
                  {item.tags && item.tags.map(tag => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#475569" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? "No matching notes found." : "Search by meaning. Gemini embeddings find matches even without exact keyword matches!"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderChat = () => {
    const chatPresets = [
      "What coding references do I have?",
      "List my study tasks",
      "Summarize everything I saved"
    ];

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.tabContent}
      >
        <FlatList
          data={chatHistory}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.chatScroll}
          ListFooterComponent={chatting ? <AIResponseShimmer /> : null}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              {item.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                </View>
              )}
              <View style={[styles.chatTextContainer, item.sender === 'user' ? styles.userTextContainer : styles.aiTextContainer]}>
                <Text style={styles.chatMessageText}>{item.message}</Text>
              </View>
            </View>
          )}
        />
        
        {chatHistory.length === 1 && (
          <View style={styles.presetsWrapper}>
            <Text style={styles.presetsTitle}>Try asking:</Text>
            <View style={styles.presetsContainer}>
              {chatPresets.map(preset => (
                <TouchableOpacity 
                  key={preset} 
                  style={styles.presetChip}
                  onPress={() => handleSendChatMessage(preset)}
                >
                  <Text style={styles.presetChipText}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask AI about notes (RAG Q&A)..."
            placeholderTextColor="#64748b"
            value={chatQuery}
            onChangeText={setChatQuery}
            onSubmitEditing={() => handleSendChatMessage()}
          />
          <TouchableOpacity 
            style={[styles.chatSendButton, chatQuery.trim() ? {} : styles.disabledSendButton]} 
            onPress={() => handleSendChatMessage()}
            disabled={chatting || !chatQuery.trim()}
          >
            {chatting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderReminders = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.reminderSectionHeader}>
          <Text style={styles.reminderSectionTitle}>Active Alerts</Text>
        </View>
        
        <FlatList
          data={reminders}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.reminderCard, item.status === 'completed' ? styles.completedReminderCard : {}]}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={styles.noteCardHeader}>
                  <Text style={[styles.noteCategoryBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }]}>
                    {item.note_category || 'Alert'}
                  </Text>
                  <Text style={styles.reminderDate}>Alert Date: {item.reminder_date}</Text>
                </View>
                <Text style={[styles.reminderContentText, item.status === 'completed' ? styles.lineThroughText : {}]}>
                  {item.message}
                </Text>
              </View>
              {item.status === 'pending' ? (
                <TouchableOpacity 
                  style={styles.completeReminderBtn} 
                  onPress={() => handleCompleteReminder(item.id)}
                >
                  <Ionicons name="checkbox-outline" size={24} color="#10b981" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="checkmark-circle" size={24} color="#475569" />
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color="#475569" />
              <Text style={styles.emptyStateText}>No reminders scheduled yet.</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderShareModal = () => {
    if (!shareModalVisible) return null;
    return (
      <View style={styles.overlayContainer}>
        <View style={[styles.detailGlassCard, { height: Dimensions.get('window').height * 0.5 }]}>
          <View style={styles.detailHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="share-social-outline" size={20} color="#c084fc" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Incoming Share Content</Text>
            </View>
            <TouchableOpacity onPress={handleCancelShare}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.detailBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailLabel}>Verify or Edit Shared Content</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 120 }]}
              placeholder="Shared text/URL..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={6}
              value={shareText}
              onChangeText={setShareText}
            />
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { flex: 1, marginTop: 0, paddingVertical: 12 }]} 
              onPress={handleCancelShare}
            >
              <Text style={[styles.secondaryButtonText, { color: '#94a3b8' }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { flex: 2 }]} 
              onPress={handleSaveSharedContent}
              disabled={shareSaving || !shareText.trim()}
            >
              {shareSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryButtonText}>Save to SmartRecall</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      {renderHeader()}
      
      <View style={styles.mainArea}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'reminders' && renderReminders()}
      </View>

      {/* Detail Overlay / Modal */}
      {selectedNote && (
        <View style={styles.overlayContainer}>
          <View style={styles.detailGlassCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailCategoryBadge}>{selectedNote.category}</Text>
              <TouchableOpacity onPress={() => setSelectedNote(null)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailLabel}>Original Note</Text>
              <Text style={styles.detailContent}>{selectedNote.content}</Text>
              
              {selectedNote.summary ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.detailLabel}>AI Summary</Text>
                  <Text style={styles.detailSummary}>{selectedNote.summary}</Text>
                </View>
              ) : null}

              {selectedNote.url ? (
                <View style={styles.urlContainer}>
                  <Ionicons name="link" size={16} color="#c084fc" style={{ marginRight: 6 }} />
                  <Text style={styles.urlText} numberOfLines={1}>{selectedNote.url}</Text>
                </View>
              ) : null}

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.detailLabel}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedNote.tags.map(tag => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Related Notes (Knowledge Proximity Visualizer) */}
              <View style={styles.relatedNotesSection}>
                <Text style={styles.detailLabel}>You might also like (Semantic Proximity)</Text>
                {renderSemanticOrbit()}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDeleteNote(selectedNote.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#f87171" style={{ marginRight: 6 }} />
              <Text style={styles.deleteButtonText}>Delete Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderShareModal()}

      {/* Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'dashboard' ? styles.activeTabItem : {}]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons name="home" size={20} color={activeTab === 'dashboard' ? '#c084fc' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'dashboard' ? styles.activeTabText : {}]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'library' ? styles.activeTabItem : {}]}
          onPress={() => setActiveTab('library')}
        >
          <Ionicons name="grid" size={20} color={activeTab === 'library' ? '#c084fc' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'library' ? styles.activeTabText : {}]}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'search' ? styles.activeTabItem : {}]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search" size={20} color={activeTab === 'search' ? '#c084fc' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'search' ? styles.activeTabText : {}]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'chat' ? styles.activeTabItem : {}]}
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons name="sparkles" size={20} color={activeTab === 'chat' ? '#c084fc' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'chat' ? styles.activeTabText : {}]}>AI Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'reminders' ? styles.activeTabItem : {}]}
          onPress={() => setActiveTab('reminders')}
        >
          <Ionicons name="alarm" size={20} color={activeTab === 'reminders' ? '#c084fc' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'reminders' ? styles.activeTabText : {}]}>Nudges</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    ...Platform.select({
      web: {
        paddingTop: 15,
      }
    })
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subLogoText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    borderRadius: 10,
  },
  mainArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '500',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  digestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  digestBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  digestText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  digestPlaceholder: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reminderCountBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  reminderMsg: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
  },
  reminderDate: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  checkButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingRight: 10,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#c084fc',
    fontWeight: '600',
  },
  notesList: {
    paddingBottom: 80,
  },
  noteCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteCategoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noteDateText: {
    color: '#64748b',
    fontSize: 11,
  },
  noteTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 6,
  },
  noteSummaryText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  tagBadgeText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBarInput: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarityScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  similarityScoreText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
  },
  chatScroll: {
    paddingBottom: 20,
  },
  chatBubble: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  chatTextContainer: {
    borderRadius: 14,
    padding: 12,
  },
  userTextContainer: {
    backgroundColor: '#8b5cf6',
    borderTopRightRadius: 2,
  },
  aiTextContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: 2,
  },
  chatMessageText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  presetsWrapper: {
    marginBottom: 12,
  },
  presetsTitle: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  presetChipText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '500',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 13,
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
  },
  reminderSectionHeader: {
    marginBottom: 12,
  },
  reminderSectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  completedReminderCard: {
    opacity: 0.5,
  },
  completeReminderBtn: {
    padding: 6,
  },
  reminderContentText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  lineThroughText: {
    textDecorationLine: 'line-through',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  detailGlassCard: {
    backgroundColor: 'rgba(20, 26, 40, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    height: Dimensions.get('window').height * 0.8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailCategoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailContent: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailSummary: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  urlText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  relatedNotesSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  relatedNoteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  relatedCategoryText: {
    color: '#c084fc',
    fontSize: 9,
    fontWeight: '600',
  },
  relatedMatchScore: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '600',
  },
  relatedContentText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
  },
  relatedPlaceholder: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
  },
  activeTabItem: {
    // Subtle glow under active tab in web
  },
  tabText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#c084fc',
    fontWeight: '600',
  },
  orbitWrapper: {
    marginTop: 12,
  },
  orbitContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    position: 'relative',
    overflow: 'hidden',
  },
  orbitCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    zIndex: 30,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  orbitCenterText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  orbitGuide: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  orbitLine: {
    position: 'absolute',
    height: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    borderStyle: 'dashed',
    zIndex: 2,
  },
  orbitMatchBadge: {
    position: 'absolute',
    backgroundColor: '#0b0f19',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  orbitMatchText: {
    color: '#10b981',
    fontSize: 8,
    fontWeight: 'bold',
  },
  orbitSatellite: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  orbitSatelliteSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  orbitPreviewCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  orbitPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orbitPreviewMatchText: {
    color: '#cbd5e1',
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '500',
  },
  orbitFocusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  orbitFocusButtonText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '600',
  },
  orbitPreviewContent: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
