-- ==========================================
-- Customer Service (客服訊息) Module
-- ==========================================

-- conversations: one per user session/order context
CREATE TABLE IF NOT EXISTS cs_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subject VARCHAR(200),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- messages: individual messages within a conversation
CREATE TABLE IF NOT EXISTS cs_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES cs_conversations(id) ON DELETE CASCADE,
    sender_id UUID,  -- NULL = system/auto-reply
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user ON cs_conversations(user_id);
CREATE INDEX idx_conversations_status ON cs_conversations(status);
CREATE INDEX idx_conversations_last ON cs_conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON cs_messages(conversation_id);
CREATE INDEX idx_messages_read ON cs_messages(conversation_id, is_read);

-- RLS
ALTER TABLE cs_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_messages ENABLE ROW LEVEL SECURITY;

-- Users can see their own conversations
CREATE POLICY "Users can view own conversations" ON cs_conversations
  FOR SELECT TO authenticated USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create conversations" ON cs_conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all conversations" ON cs_conversations
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages: users see own, admins see all
CREATE POLICY "Users can view own messages" ON cs_messages
  FOR SELECT TO authenticated USING (
    conversation_id IN (
      SELECT id FROM cs_conversations WHERE user_id = (SELECT id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON cs_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_type = 'user' AND
    conversation_id IN (
      SELECT id FROM cs_conversations WHERE user_id = (SELECT id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all messages" ON cs_messages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );