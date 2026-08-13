import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAiResponse } from '../services/api';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// RAG Database mock inside mobile view (fallback detail checks)
const RAG_DOCS = {
  return_policy: "Groceries & snack packs can be returned within 7 days of delivery if unopened. Seals must be intact.",
  shipping: "Delivery to your address takes 10-20 minutes, managed by local Snacko micro-warehouses.",
  freshness: "Quality scans ensure all items have a remaining shelf life of 60 days minimum.",
  coupons: "Codes: SNACKNEW20 (20% off first order) & SNACKY10 (10% flat off)."
};

export default function MobileAiAssistant({ 
  visible, 
  onClose, 
  apiBase, 
  token, 
  user, 
  cart, 
  addToCart, 
  pincode, 
  serviceable, 
  showToastMsg 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am your mobile AI Shopping Assistant. Ask me to recommend snacks, check order tracking, or list store policy FAQs!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Simulators & overlays
  const [activeCitationKey, setActiveCitationKey] = useState(null);

  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages, isThinking, thinkingSteps]);

  // Thinking loader simulator
  const runThinkingProcess = async (steps) => {
    setIsThinking(true);
    setThinkingSteps(steps.map((text, idx) => ({ text, status: idx === 0 ? 'active' : 'pending' })));
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setThinkingSteps(prev => {
        const next = [...prev];
        next[i].status = 'completed';
        if (next[i+1]) next[i+1].status = 'active';
        return next;
      });
      setActiveStepIndex(i + 1);
    }
    setIsThinking(false);
  };

  // Add to cart directly
  const handleAddToCart = (product) => {
    addToCart(product, pincode, serviceable);
  };

  // Quick prompt handler
  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
    sendMessage(promptText);
  };

  // Camera simulator trigger


  // Send chatbot prompt
  const sendMessage = async (forcedText = null) => {
    const textToSend = forcedText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const lower = textToSend.toLowerCase();
    let thinkingStepsList = ["Understanding query...", "Querying inventory database..."];
    if (lower.includes("price") || lower.includes("under") || lower.includes("budget")) {
      thinkingStepsList = ["Parsing budget constraints...", "Searching database for prices...", "Verifying stock quantities..."];
    } else if (lower.includes("compare") || lower.includes("vs")) {
      thinkingStepsList = ["Identifying comparison products...", "Retrieving details...", "Formatting specification matrix..."];
    } else if (lower.includes("track") || lower.includes("order")) {
      thinkingStepsList = ["Opening order archives...", "Retrieving GPS delivery coordinator status..."];
    }

    await runThinkingProcess(thinkingStepsList);

    let responseText = "Unable to reach store AI assistant server.";
    let recommendedProducts = [];
    let compareProducts = [];
    let trackingOrder = null;
    let ragSourcesList = [];

    try {
      const res = await getAiResponse(apiBase, token, textToSend, user?.id || null);
      if (res.success) {
        responseText = res.text;
        recommendedProducts = res.products || [];
        compareProducts = res.compareList || [];
        trackingOrder = res.orderTracking || null;
        ragSourcesList = res.ragSources || [];
      }
    } catch (err) {
      console.error(err);
      responseText = "Sorry, I can't reach the AI backend endpoint. Please check your internet connection.";
    }

    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: recommendedProducts,
      compareList: compareProducts,
      orderTracking: trackingOrder,
      ragSources: ragSourcesList
    };

    setMessages(prev => [...prev, botMsg]);
  };

  const renderMessageItem = ({ item }) => {
    const isBot = item.sender === 'assistant';
    return (
      <View style={[styles.msgRow, isBot ? styles.msgRowAi : styles.msgRowUser]}>
        {isBot && (
          <View style={styles.msgAvatar}>
            <Ionicons name="sparkles" size={14} color="#ffffff" />
          </View>
        )}
        
        <View style={[styles.msgBubble, isBot ? styles.msgBubbleAi : styles.msgBubbleUser]}>
          <Text style={[styles.msgText, isBot ? styles.msgTextAi : styles.msgTextUser]}>
            {item.text}
          </Text>

          {/* Recommended products carousel */}
          {isBot && item.products && item.products.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardCarousel}>
              {item.products.map(p => {
                const inCart = cart.find(ci => ci.product.product_id === p.product_id);
                return (
                  <View key={p.product_id} style={styles.productCard}>
                    <Image 
                      source={{ uri: p.product_image || "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?w=150" }} 
                      style={styles.cardImage} 
                    />
                    
                    {p.reasonTag && (
                      <View style={styles.reasonBadge}>
                        <Text style={styles.reasonBadgeText}>{p.reasonTag}</Text>
                      </View>
                    )}

                    <Text style={styles.cardTitle} numberOfLines={1}>{p.product_name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{p.whyDescription || p.product_description || "In stock"}</Text>
                    
                    <View style={styles.cardPriceRow}>
                      <Text style={styles.cardPrice}>₹{p.discount_price || p.price}</Text>
                      {p.discount_price && <Text style={styles.cardPriceOld}>₹{p.price}</Text>}
                    </View>

                    <TouchableOpacity 
                      style={[styles.addBtn, inCart ? styles.addBtnInCart : null]} 
                      onPress={() => handleAddToCart(p)}
                    >
                      <Ionicons name="cart-outline" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.addBtnText}>{inCart ? `Cart (${inCart.quantity})` : 'Add'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Comparison spec grid */}
          {isBot && item.compareList && item.compareList.length > 0 && (
            <View style={styles.compareContainer}>
              <Text style={styles.compareTitle}>Side-by-Side Comparison</Text>
              {item.compareList.map((p, idx) => (
                <View key={p.product_id} style={styles.compareRow}>
                  <Text style={styles.compareLabel}>{p.product_name}</Text>
                  <Text style={styles.compareVal}>₹{p.discount_price || p.price} | {idx === 0 ? "Best Choice" : "Alternative"}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Order tracking pipeline */}
          {isBot && item.orderTracking && (
            <View style={styles.trackingCard}>
              <View style={styles.trackingHeader}>
                <Text style={styles.trackingNumber}>{item.orderTracking.orderNumber}</Text>
                <Text style={styles.trackingStatus}>{item.orderTracking.status.toUpperCase()}</Text>
              </View>
              
              <View style={styles.trackDetails}>
                <Text style={styles.trackDetailText}>Courier: {item.orderTracking.courier}</Text>
                <Text style={styles.trackDetailText}>Est. Delivery: {item.orderTracking.expectedDelivery}</Text>
                <Text style={styles.trackDetailText}>Address: {item.orderTracking.address}</Text>
              </View>

              <TouchableOpacity 
                style={styles.escalateBtn}
                onPress={() => handleQuickPrompt("Talk to support agent")}
              >
                <Text style={styles.escalateBtnText}>Contact Logistics Agent</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* RAG citations */}
          {isBot && item.ragSources && item.ragSources.length > 0 && (
            <View style={styles.ragContainer}>
              <Text style={styles.ragTitle}>Sources Verified:</Text>
              <View style={styles.ragList}>
                {item.ragSources.map(srcKey => (
                  <TouchableOpacity 
                    key={srcKey} 
                    style={styles.ragPill}
                    onPress={() => setActiveCitationKey(activeCitationKey === srcKey ? null : srcKey)}
                  >
                    <Ionicons name="document-text-outline" size={10} color="#7c2d12" />
                    <Text style={styles.ragPillText}>{srcKey === 'return_policy' ? 'Return Policy' : srcKey === 'shipping' ? 'Logistics SLA' : 'Freshness Standard'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {activeCitationKey && item.ragSources.includes(activeCitationKey) && (
                <View style={styles.ragContentBox}>
                  <Text style={styles.ragContentText}>{RAG_DOCS[activeCitationKey] || "Policies verified in catalog system."}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.msgTime}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        
        {/* Header toolbar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Snacko AI assistant</Text>
            <Text style={styles.headerSub}>🟢 Powered by Gemini 2.5 RAG</Text>
          </View>
          
          <TouchableOpacity onPress={() => setMessages([messages[0]])} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>



        {/* Messages scroll */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={() => (
            isThinking && (
              <View style={styles.thinkingBox}>
                <ActivityIndicator size="small" color="#7c2d12" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  {thinkingSteps.map((step, idx) => (
                    <Text key={idx} style={[styles.thinkingStep, step.status === 'active' ? styles.thinkingStepActive : null]}>
                      {step.status === 'completed' ? '✓ ' : '● '}{step.text}
                    </Text>
                  ))}
                </View>
              </View>
            )
          )}
        />

        {/* Quick action prompts */}
        <View style={styles.quickChipsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Recommend snacks under ₹100")}>
              <Text style={styles.chipText}>🍟 Under ₹100</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Compare chips")}>
              <Text style={styles.chipText}>⚖️ Compare Chips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Can I return an item?")}>
              <Text style={styles.chipText}>🛡️ Returns</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleQuickPrompt("Track my recent order")}>
              <Text style={styles.chipText}>📦 Track Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Footer inputs area */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputContainer}>
            
            <TextInput 
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about catalog, tracking, return guidelines..."
              placeholderTextColor="#94a3b8"
            />



            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
              <Ionicons name="send" size={16} color="#ffffff" />
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>




      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  clearBtn: {
    padding: 6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#ffedd5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileText: {
    fontSize: 11.5,
    color: '#7c2d12',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgRowAi: {
    alignSelf: 'flex-start',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c2d12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  msgBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  msgBubbleAi: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 4,
  },
  msgBubbleUser: {
    backgroundColor: '#7c2d12',
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextAi: {
    color: '#334155',
  },
  msgTextUser: {
    color: '#ffffff',
    fontWeight: '500',
  },
  msgTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  thinkingBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  thinkingStep: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  thinkingStepActive: {
    color: '#7c2d12',
    fontWeight: '700',
  },
  quickChipsWrap: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 8,
  },
  quickChipsScroll: {
    paddingHorizontal: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  iconButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: -2,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    fontSize: 13.5,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c2d12',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  cardCarousel: {
    marginTop: 12,
    marginBottom: 4,
  },
  productCard: {
    width: 140,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
  },
  cardImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  reasonBadge: {
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  reasonBadgeText: {
    fontSize: 8,
    color: '#b45309',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ea580c',
  },
  cardPriceOld: {
    fontSize: 9.5,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: '#7c2d12',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
  },
  addBtnInCart: {
    backgroundColor: '#16a34a',
  },
  addBtnText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  compareContainer: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
  },
  compareTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  compareLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  compareVal: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: 'bold',
  },
  trackingCard: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  trackingNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  trackingStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  trackDetails: {
    gap: 4,
  },
  trackDetailText: {
    fontSize: 11,
    color: '#475569',
  },
  escalateBtn: {
    backgroundColor: '#475569',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  escalateBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  ragContainer: {
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  ragTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  ragList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ragPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffedd5',
    borderWidth: 0.5,
    borderColor: '#fed7aa',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  ragPillText: {
    fontSize: 9.5,
    color: '#7c2d12',
    fontWeight: '600',
  },
  ragContentBox: {
    backgroundColor: '#fff7ed',
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#ea580c',
  },
  ragContentText: {
    fontSize: 10.5,
    color: '#7c2d12',
    lineHeight: 14,
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogPanel: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  dialogOption: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  dialogOptionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  dialogClose: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dialogCloseText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  dialogAction: {
    backgroundColor: '#7c2d12',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  dialogActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  scannerBox: {
    width: 240,
    height: 160,
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerImg: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  scannerLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'red',
  },
  voiceOverlay: {
    flex: 1,
    backgroundColor: '#3a2318',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  voiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  voiceSubtitle: {
    fontSize: 13,
    color: '#fed7aa',
    textAlign: 'center',
    marginBottom: 40,
  },
  voiceButtons: {
    alignItems: 'center',
    gap: 16,
  },
  voiceHangup: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceSimPhrase: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  voiceSimText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  }
});
